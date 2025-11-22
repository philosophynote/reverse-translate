import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { message } = body;

    // バリデーション
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "メッセージが必要です" },
        { status: 400 }
      );
    }

    // Mastraワークフローインスタンスを取得
    const { mastra } = await import("../../../../src/mastra");
    const workflow = mastra.getWorkflow("translateWorkflow");

    if (!workflow) {
      return NextResponse.json(
        { error: "ワークフローが見つかりません" },
        { status: 404 }
      );
    }

    // ワークフローを実行
    const run = await workflow.createRunAsync();
    const result = await run.start({
      inputData: { message }
    });

    // 結果を確認
    if (result.status === "success" && result.result) {
      return NextResponse.json({
        success: true,
        originalMessage: result.result.originalMessage,
        translatedMessage: result.result.translatedMessage,
        thinking: result.result.thinking,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "ワークフローの実行に失敗しました",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Workflow execution error:", error);
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
