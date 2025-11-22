import { NextRequest, NextResponse } from "next/server";
import type { WorkflowStreamEvent } from "@mastra/core/workflows";
import type { WorkflowStage } from "@/types/chat";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "メッセージが必要です" },
        { status: 400 }
      );
    }

    const { mastra } = await import("../../../../src/mastra");
    const workflow = mastra.getWorkflow("translateWorkflow");

    if (!workflow) {
      return NextResponse.json(
        { error: "ワークフローが見つかりません" },
        { status: 404 }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        (async () => {
          const sendEvent = (payload: Record<string, unknown>) => {
            controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
          };

          const sendError = (error: Error | string) => {
            const message =
              typeof error === "string"
                ? error
                : error instanceof Error
                  ? error.message
                  : "ワークフロー実行中にエラーが発生しました";
            sendEvent({ type: "error", message });
          };

          let answerSent = false;
          let doneSent = false;
          let latestStages: WorkflowStage[] = [];

          const streamAnswer = async (text: string) => {
            if (answerSent) return;
            answerSent = true;
            const chunks = chunkText(text ?? "");
            for (const chunk of chunks) {
              sendEvent({ type: "answer", content: chunk });
              await wait(80);
            }
          };

          const sendDone = () => {
            if (doneSent) return;
            sendEvent({ type: "done" });
            doneSent = true;
          };

          try {
            const run = await workflow.createRunAsync();
            const runOutput = await run.streamAsync({
              inputData: { message },
            });
            const finalResultPromise = runOutput.result;
            let resolvedResult: Awaited<typeof finalResultPromise> | null = null;

            const reader = runOutput.fullStream.getReader();

            const handleStages = (stages: WorkflowStage[]) => {
              latestStages = stages.map((stage) => ({ ...stage }));
              sendEvent({ type: "thinking", stages: latestStages });
            };

            const handleWorkflowEvent = async (event: WorkflowStreamEvent) => {
              switch (event.type) {
                case "workflow-step-result": {
                  const payload = event.payload;
                  if (payload.status === "failed") {
                    const outputDetails = (payload.output ?? {}) as {
                      error?: unknown;
                      stages?: WorkflowStage[];
                      finalJapaneseAnswer?: string;
                    };
                    const payloadDetails = (payload.payload ?? {}) as {
                      error?: unknown;
                    };
                    const failureMessage =
                      (typeof outputDetails.error === "string" && outputDetails.error) ||
                      (typeof payloadDetails.error === "string" && payloadDetails.error) ||
                      "ステップの実行に失敗しました";
                    throw new Error(failureMessage);
                  }

                  const stepOutput = (payload.output ?? {}) as {
                    stages?: WorkflowStage[];
                    finalJapaneseAnswer?: string;
                  };

                  if (Array.isArray(stepOutput.stages)) {
                    handleStages(stepOutput.stages);
                  }

                  const finalJapaneseAnswer =
                    typeof stepOutput.finalJapaneseAnswer === "string"
                      ? stepOutput.finalJapaneseAnswer.trim()
                      : "";
                  if (finalJapaneseAnswer) {
                    await streamAnswer(finalJapaneseAnswer);
                  }
                  break;
                }
                case "workflow-step-suspended": {
                  throw new Error("ワークフローが一時停止しました");
                }
                case "workflow-finish": {
                  if (event.payload.workflowStatus !== "success") {
                    if (!resolvedResult) {
                      try {
                        resolvedResult = await finalResultPromise;
                      } catch {
                        resolvedResult = null;
                      }
                    }
                    const message =
                      resolvedResult && resolvedResult.status === "failed"
                        ? resolvedResult.error?.message ?? String(resolvedResult.error ?? "ワークフローが失敗しました")
                        : "ワークフローが失敗しました";
                    throw new Error(message);
                  }
                  break;
                }
                default:
                  break;
              }
            };

            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (!value) continue;
              await handleWorkflowEvent(value);
            }

            if (!resolvedResult) {
              resolvedResult = await finalResultPromise;
            }

            if (!answerSent) {
              const finalAnswer =
                resolvedResult && resolvedResult.status === "success"
                  ? resolvedResult.result.finalJapaneseAnswer
                  : undefined;
              await streamAnswer(finalAnswer ?? "(結果が取得できませんでした)");
            }

            if (
              !latestStages.length &&
              resolvedResult &&
              resolvedResult.status === "success" &&
              Array.isArray(resolvedResult.result.stages)
            ) {
              handleStages(resolvedResult.result.stages);
            }

            sendDone();
          } catch (error) {
            console.error("Streaming workflow error:", error);
            sendError(error as Error);
          } finally {
            controller.close();
          }
        })();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Workflow request error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ワークフローの実行準備中にエラーが発生しました",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}

function chunkText(text: string, chunkSize = 40): string[] {
  const sanitized = text ?? "";
  const chunks: string[] = [];
  let pointer = 0;
  while (pointer < sanitized.length) {
    chunks.push(sanitized.slice(pointer, pointer + chunkSize));
    pointer += chunkSize;
  }
  return chunks.length ? chunks : ["(結果が取得できませんでした)"];
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
