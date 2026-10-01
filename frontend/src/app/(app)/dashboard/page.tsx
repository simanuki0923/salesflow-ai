import {
  BriefcaseBusiness,
  CalendarDays,
  ListTodo,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

/* =========================================================
 * TypeScript 型定義
 * ========================================================= */

/**
 * Dashboard上部に表示する集計カード1件分の型。
 *
 * 例：
 * ・顧客数
 * ・案件数
 * ・未完了タスク
 * ・今月の商談
 *
 * LucideIconを使用することで、
 * lucide-reactのアイコンコンポーネントを
 * iconプロパティとして保持できる。
 */
type SummaryCard = {
  // カードタイトル
  title: string;

  // メインとなる数値
  value: string;

  // 「件」などの単位
  unit: string;

  // 前月比などの変化率
  change: string;

  // lucide-reactのアイコン
  icon: LucideIcon;

  // アイコン部分へ適用するTailwind CSS
  iconClass: string;

  // 増減率部分へ適用するTailwind CSS
  changeClass: string;
};

/**
 * タスクに設定できる優先度。
 *
 * string型にしてしまうと、
 * "AAA"など想定外の文字も登録できてしまう。
 *
 * Union型を使うことで
 * 「高」「中」「低」の3つだけに制限する。
 */
type TaskPriority = "高" | "中" | "低";

/**
 * Dashboardの「今後のタスク」に表示する
 * タスク1件分の型。
 */
type DashboardTask = {
  id: number;
  title: string;
  dueDate: string;
  priority: TaskPriority;
};

/**
 * Dashboardの「最近の商談」に表示する
 * 商談1件分の型。
 */
type RecentMeeting = {
  customer: string;
  project: string;
  date: string;
};

/**
 * Dashboardの「お知らせ」に表示する
 * お知らせ1件分の型。
 */
type Notification = {
  id: number;
  date: string;
  message: string;
};

/**
 * 案件ステータス1件分の型。
 *
 * countには該当ステータスの案件数を保持する。
 * colorClassは円グラフ横の凡例に使用する。
 */
type ProjectStatus = {
  label: string;
  count: number;
  colorClass: string;
};


/* =========================================================
 * Mockデータ
 * =========================================================
 *
 * 現段階ではLaravel APIへ接続していないため、
 * UI確認用として固定データを使用する。
 *
 * Laravel API完成後は、
 *
 * GET /api/v1/dashboard
 *
 * などから取得したデータへ置き換える予定。
 * ========================================================= */

/**
 * Dashboard上部に表示する4つの集計カード。
 *
 * SummaryCard[] と指定することで、
 * 配列の各要素がSummaryCard型に沿っているか
 * TypeScriptがチェックしてくれる。
 */
const summaryCards: SummaryCard[] = [
  {
    title: "顧客数",
    value: "52",
    unit: "件",
    change: "+12%",
    icon: Users,
    iconClass: "bg-emerald-100 text-emerald-600",
    changeClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "案件数",
    value: "18",
    unit: "件",
    change: "+6%",
    icon: BriefcaseBusiness,
    iconClass: "bg-blue-100 text-blue-600",
    changeClass: "bg-blue-50 text-blue-600",
  },
  {
    title: "未完了タスク",
    value: "12",
    unit: "件",
    change: "+20%",
    icon: ListTodo,
    iconClass: "bg-orange-100 text-orange-600",
    changeClass: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "今月の商談",
    value: "8",
    unit: "件",
    change: "+33%",
    icon: CalendarDays,
    iconClass: "bg-violet-100 text-violet-600",
    changeClass: "bg-blue-50 text-blue-600",
  },
];

/**
 * Dashboardへ表示する案件ステータス。
 *
 * 将来的にはprojectsテーブルのstatusを
 * Laravel側で集計して取得する想定。
 */
const projectStatuses: ProjectStatus[] = [
  {
    label: "提案中",
    count: 5,
    colorClass: "bg-blue-600",
  },
  {
    label: "進行中",
    count: 6,
    colorClass: "bg-blue-400",
  },
  {
    label: "完了",
    count: 5,
    colorClass: "bg-green-400",
  },
  {
    label: "下書き",
    count: 2,
    colorClass: "bg-amber-400",
  },
  {
    label: "中止",
    count: 1,
    colorClass: "bg-rose-400",
  },
];

/**
 * 今後対応予定のタスク一覧。
 *
 * 現在はMockデータ。
 * 将来的にはLaravelのtasksテーブルから
 * ログインユーザーに関係するタスクを取得する。
 */
const tasks: DashboardTask[] = [
  {
    id: 1,
    title: "A社へ見積書提出",
    dueDate: "2026/10/10",
    priority: "高",
  },
  {
    id: 2,
    title: "B社へ連絡",
    dueDate: "2026/10/12",
    priority: "中",
  },
  {
    id: 3,
    title: "C社LP案件対応",
    dueDate: "2026/10/15",
    priority: "中",
  },
  {
    id: 4,
    title: "デザイン確認",
    dueDate: "2026/10/15",
    priority: "低",
  },
];

/**
 * 最近登録された商談情報。
 *
 * Laravel API完成後は、
 * meeting_notesテーブルなどから
 * 最新の商談を取得する形へ変更する。
 */
const recentMeetings: RecentMeeting[] = [
  {
    customer: "A社株式会社",
    project: "Webサイトリニューアル",
    date: "2026/10/08",
  },
  {
    customer: "B社株式会社",
    project: "ECサイト構築",
    date: "2026/10/06",
  },
  {
    customer: "C社商事",
    project: "システム開発",
    date: "2026/10/05",
  },
];

/**
 * Dashboardのお知らせ一覧。
 *
 * 現段階では固定データだが、
 * 後々はタスク期限通知やAI処理完了通知などを
 * Laravel側から取得できるようにする。
 */
const notifications: Notification[] = [
  {
    id: 1,
    date: "2026/10/08",
    message: "A社商談を登録しました。",
  },
  {
    id: 2,
    date: "2026/10/06",
    message: "タスクの期限が明日になりました。",
  },
  {
    id: 3,
    date: "2026/10/03",
    message: "新しい分析機能をリリースしました。",
  },
];


/* =========================================================
 * Dashboardページ
 * ========================================================= */

/**
 * SalesFlow AI Dashboard画面。
 *
 * 営業活動に必要な情報を1画面で確認できるようにする。
 *
 * 主な表示内容：
 *
 * ・顧客数
 * ・案件数
 * ・未完了タスク
 * ・今月の商談
 * ・案件ステータス
 * ・今後のタスク
 * ・最近の商談
 * ・お知らせ
 *
 * 現在はServer Componentとして動作する。
 *
 * useStateやuseEffectなどを使用していないため、
 * "use client" は不要。
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">

      {/* =====================================================
       * ページタイトル
       * ===================================================== */}
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          ダッシュボード
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          営業活動の状況をまとめて確認できます。
        </p>
      </section>


      {/* =====================================================
       * Dashboard上部 集計カード
       * =====================================================
       *
       * summaryCards配列をmap()で繰り返し処理し、
       * 同じデザインのカードを4件生成する。
       *
       * 同じHTMLを4回書かずに済むため、
       * 修正もしやすくなる。
       * ===================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          /*
           * card.iconにはLucideアイコンの
           * Reactコンポーネントが保存されている。
           *
           * 大文字から始まるIconという変数へ代入することで、
           * <Icon />としてJSX内で使用できる。
           */
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">

                {/* カード左側 */}
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {card.value}
                    </span>

                    <span className="mb-1 text-sm font-semibold text-slate-600">
                      {card.unit}
                    </span>
                  </div>
                </div>

                {/* カード右上のアイコン */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconClass}`}
                >
                  <Icon size={22} />
                </div>
              </div>

              {/* 前月比などの増減表示 */}
              <div className="mt-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${card.changeClass}`}
                >
                  ↑ {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </section>


      {/* =====================================================
       * Dashboardメイン領域
       *
       * PCでは2列表示、
       * 小さい画面では1列表示にする。
       * ===================================================== */}
      <section className="grid gap-6 xl:grid-cols-2">

        {/* ===================================================
         * 案件ステータス
         * =================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            案件ステータス
          </h2>

          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">

            {/*
             * 現段階ではグラフライブラリを使わず、
             * CSSのconic-gradientでドーナツグラフを再現する。
             *
             * Laravel API接続後、
             * 案件件数を動的に表示したくなった段階で
             * Rechartsなどへ変更する予定。
             */}
            <div
              className="
                relative
                flex
                h-52
                w-52
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[conic-gradient(
                  #2563eb_0deg_100deg,
                  #60a5fa_100deg_220deg,
                  #4ade80_220deg_310deg,
                  #fbbf24_310deg_345deg,
                  #fb7185_345deg_360deg
                )]
              "
            >
              {/* ドーナツグラフ中央の白い円 */}
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-900">
                  18件
                </span>

                <span className="text-sm text-slate-400">
                  総計
                </span>
              </div>
            </div>


            {/* 案件ステータス凡例 */}
            <div className="w-full space-y-4">
              {projectStatuses.map((status) => (
                <div
                  key={status.label}
                  className="flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-3">

                    {/* ステータスごとの色 */}
                    <span
                      className={`h-3 w-3 rounded ${status.colorClass}`}
                    />

                    <span className="text-sm text-slate-600">
                      {status.label}
                    </span>
                  </div>

                  {/* ステータスごとの案件件数 */}
                  <span className="text-sm font-bold text-slate-800">
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* ===================================================
         * 今後のタスク
         * =================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* タイトルとリンク */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              今後のタスク
            </h2>

            {/*
             * 現段階では画面デザイン用のbutton。
             *
             * /tasks画面を作成した後は
             * Next.jsの<Link>へ変更する。
             */}
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              すべて見る
            </button>
          </div>


          {/* タスク一覧 */}
          <div className="mt-5 divide-y divide-slate-100">

            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 py-4"
              >
                {/* 完了チェック */}
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300"
                />

                {/* タスク名 */}
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                  {task.title}
                </p>

                {/* PC・タブレット時のみ期限を表示 */}
                <span className="hidden text-sm text-slate-400 sm:block">
                  {task.dueDate}
                </span>

                {/*
                 * priorityの値によって色を切り替える。
                 *
                 * 高 → 赤
                 * 中 → オレンジ
                 * 低 → 緑
                 */}
                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-xs font-semibold",

                    task.priority === "高"
                      ? "bg-red-50 text-red-500"
                      : task.priority === "中"
                        ? "bg-orange-50 text-orange-500"
                        : "bg-emerald-50 text-emerald-600",
                  ].join(" ")}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>


        {/* ===================================================
         * 最近の商談
         * =================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              最近の商談
            </h2>

            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              すべて見る
            </button>
          </div>


          {/* 最近の商談一覧 */}
          <div className="mt-5 divide-y divide-slate-100">

            {recentMeetings.map((meeting) => (
              <div
                /*
                 * customerとdateを組み合わせて
                 * Reactのkeyとして使用する。
                 *
                 * 本番ではmeeting.idを使用するのが望ましい。
                 */
                key={`${meeting.customer}-${meeting.date}`}
                className="
                  grid
                  gap-2
                  py-4
                  text-sm
                  sm:grid-cols-[1fr_1.3fr_auto]
                "
              >
                {/* 顧客名 */}
                <span className="font-semibold text-slate-700">
                  {meeting.customer}
                </span>

                {/* 案件名 */}
                <span className="text-slate-600">
                  {meeting.project}
                </span>

                {/* 商談日 */}
                <span className="text-slate-400">
                  {meeting.date}
                </span>
              </div>
            ))}
          </div>
        </div>


        {/* ===================================================
         * お知らせ
         * =================================================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              お知らせ
            </h2>

            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              すべて見る
            </button>
          </div>


          {/* お知らせ一覧 */}
          <div className="mt-5 divide-y divide-slate-100">

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="
                  grid
                  gap-2
                  py-4
                  text-sm
                  sm:grid-cols-[120px_1fr]
                "
              >
                {/* 通知日 */}
                <span className="text-slate-400">
                  {notification.date}
                </span>

                {/* 通知内容 */}
                <span className="text-slate-600">
                  {notification.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}