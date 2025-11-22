import { NextRequest, NextResponse } from "next/server";

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
    const workflow = mastra.getWorkflow("chuuniWorkflow");

    if (!workflow) {
      return NextResponse.json(
        { error: "厨二病ワークフローが見つかりません" },
        { status: 404 }
      );
    }

    const run = await workflow.createRunAsync();
    const result = await run.start({
      inputData: { message },
    });

    if (result.status === "success" && result.result) {
      return NextResponse.json({
        success: true,
        chuuniText: result.result.chuuniText,
      });
    }

    return NextResponse.json(
      { success: false, error: "ワークフローの実行に失敗しました" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Chuuni workflow execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "ワークフローの実行中にエラーが発生しました",
        details: error instanceof Error ? error.message : "不明なエラー",
      },
      { status: 500 }
    );
  }
}
