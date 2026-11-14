# SalesFlow AI

営業活動における顧客・案件・タスク・商談情報を一元管理する、個人開発のCRM Webアプリケーションです。

LaravelによるREST APIとNext.jsによるFrontendを分離した構成とし、認証・CRUD・ダッシュボード・AI営業支援機能に加えて、テスト、Security Audit、CI、Dependabot、本番Deploymentまで含めた継続的な開発・運用を意識して実装しています。

## 公開Demo

SalesFlow AIはPortfolio用Demo環境として公開しています。

### Frontend

https://salesflow-ai-bay.vercel.app

### Backend API

https://salesflow-ai-production-4493ac2e.up.railway.app

### Demo Account

```text
Email: demo@salesflow-ai.local
Password: demo-password
```

Demo AccountはRead Onlyです。

以下の機能を確認できます。

- Customer / Project / Task / Meetingの閲覧
- Dashboardによる営業状況の確認
- Meeting AI Assistantによる提案生成
- Customer / Project単位の関連情報確認

Demo Accountではデータの登録・変更・削除はできません。

Frontend側で操作を制限するとともに、Backend API側でも書き込みを拒否することで、公開Demo Dataを保護しています。

---

## プロジェクト概要

SalesFlow AIでは、営業担当者が日常的に扱う以下の情報を一つのシステムで管理できます。

- 顧客情報
- 営業案件
- タスク
- 商談・打ち合わせ
- ダッシュボードによる進捗確認
- AIによる商談結果・次回対応案の提案

単純なCRUDアプリケーションだけではなく、認証・データ所有権・AI API連携・外部APIコスト管理・Rate Limit・自動テスト・Security Audit・CI・Production Deploymentまで含めて設計しています。

## 開発目的

Webアプリケーション開発に必要となるFrontend / Backend / Database / Authentication / Test / Security / CI / Deploymentを一通り実装し、個人開発として継続的に改善・運用できるシステムを構築することを目的としています。

特に以下を意識しています。

- FrontendとBackendの責務分離
- REST APIを利用したデータ連携
- Login User単位のデータ所有権管理
- 安全なAuthentication Token管理
- 外部AI APIへ直接依存しすぎない設計
- AI提案を人間が確認してから保存するHuman-in-the-loop
- API利用料金を考慮したDemo Provider
- 公開Demo Dataを保護するRead Only制御
- 既知脆弱性への継続的な対応
- Pull Request単位での自動品質チェック
- Production環境を想定したFrontend / Backend / Database分離

## 主な機能

### Authentication

Laravel Sanctumを利用した認証を実装しています。

Production環境では、FrontendのVercelとBackendのRailwayが異なるDomainで動作するため、Sanctum Personal Access TokenによるBearer Token認証を利用しています。

```text
Browser
 ↓
Next.js / Vercel
 ↓ HttpOnly Cookie
Next.js Route Handler
 ↓ Authorization: Bearer Token
Laravel / Railway
 ↓
PostgreSQL
```

Laravel Backendが発行したTokenはBrowser JavaScriptへ直接公開せず、Next.js側のHttpOnly Cookieへ保存します。

Client ComponentからLaravel APIへ通信する場合もNext.js Route Handlerを経由し、Server側でBearer TokenをAuthorization Headerへ設定します。

実装している主な認証機能:

- Login
- Logout
- Login User取得
- Sanctum Personal Access Token発行
- Logout時のToken失効
- HttpOnly CookieによるToken保護
- 未認証UserからのAPIアクセス制御
- Laravel Session / Cookie認証との互換性維持

### Customer

営業活動の起点となる顧客情報を管理します。

- 顧客一覧
- 顧客登録
- 顧客詳細
- 顧客編集
- 顧客削除
- 顧客単位の案件・活動情報表示
- Login Userごとの所有権制御

### Project

顧客に紐づく営業案件を管理します。

- 案件一覧
- 案件検索
- Status Filter
- 案件登録
- 案件詳細
- 案件編集
- 案件削除
- 顧客との関連付け
- 案件単位のTask / Meeting表示

### Task

営業案件に紐づくタスクを管理します。

- Task一覧
- 検索
- Filter
- 登録
- 編集
- 削除
- 完了状態管理
- 完了日時管理
- Login Userの案件以外へのアクセス防止

### Meeting

営業案件に紐づく商談・打ち合わせを管理します。

- Meeting一覧
- 検索
- Filter
- 登録
- 編集
- 削除
- Scheduled / Completed / CancelledのStatus管理
- 対面 / Online / 電話などの商談方法管理
- 商談結果
- 次回対応
- 完了日時管理

### Dashboard

営業活動全体の状況を確認できるDashboardを実装しています。

Customer / Projectに加えて、Task・Meetingの集計情報や直近予定を表示します。

## Public Demo Safe Mode

公開Demo AccountではRead Only制御を実装しています。

Frontendで保存・削除操作を制限するだけではなく、Backend API側でもDemo UserからのMutation Requestを拒否します。

```text
Demo User
 ↓
POST / PATCH / PUT / DELETE
 ↓
Demo Read Only Middleware
 ↓
403 Forbidden
```

これにより、Frontend側の操作を回避してAPIへ直接Requestを送信した場合でも、Demo Dataを変更できない構成にしています。

Meeting AI AssistantについてはDemo Accountでも利用可能です。

## Meeting AI Assistant

商談内容から、営業担当者向けに以下を提案するAI支援機能を実装しています。

- 商談結果の要約案
- 次回対応案

AIがMeetingを直接更新することはありません。

```text
User
 ↓
Meeting Form
 ↓
AI提案Request
 ↓
AI Provider
 ↓
result / nextAction Proposal
 ↓
Userが内容を確認・修正
 ↓
通常のMeeting保存API
```

AIが生成した内容をそのままDatabaseへ保存せず、Userが確認してから保存するHuman-in-the-loop構成にしています。

## AI Provider設計

Meeting AIは特定のAI ProviderへControllerが直接依存しない構成にしています。

```text
MeetingAiSuggestionController
        ↓
MeetingAiSuggestionService
        ↓
MeetingAiSuggestionProvider
        │
        ├─ DemoMeetingSuggestionService
        │
        └─ OpenAiMeetingSuggestionService
```

環境変数によってProviderを切り替えられます。

### Demo Provider

```env
MEETING_AI_ENABLED=true
AI_PROVIDER=demo
```

外部AI APIへ通信せずDemo提案を生成します。

Productionの公開Portfolio環境ではDemo Providerを使用し、OpenAI API利用料金が継続的に発生しない構成にしています。

### OpenAI Provider

```env
MEETING_AI_ENABLED=true
AI_PROVIDER=openai
```

OpenAI Responses APIを利用してStructured Output形式で、

- `result`
- `nextAction`

を取得します。

OpenAI API KeyはFrontendへ公開せず、Laravel Backendからのみ利用します。

### AI機能停止

```env
MEETING_AI_ENABLED=false
```

AI提案機能自体を停止することも可能です。

## AI Rate Limit

Meeting AI APIにはLogin User単位のRate Limitを設定しています。

デフォルト:

```text
5 requests / minute / user
```

設定値は環境変数で変更できます。

```env
MEETING_AI_RATE_LIMIT_PER_MINUTE=5
```

これにより、公開環境での過剰Request抑制と、OpenAI Provider利用時のAPIコスト増加防止を行います。

## Architecture

```mermaid
flowchart TD
    Browser[Browser]

    Vercel[Vercel]
    Next[Next.js / TypeScript]
    Proxy[Next.js Route Handler]

    Railway[Railway]
    Laravel[Laravel REST API]
    Auth[Laravel Sanctum]

    Customer[Customer]
    Project[Project]
    Task[Task]
    Meeting[Meeting]

    AIService[Meeting AI Service]
    Demo[Demo Provider]
    OpenAI[OpenAI Responses API]

    DB[(Railway PostgreSQL)]

    Browser --> Vercel
    Vercel --> Next
    Next --> Proxy

    Proxy -->|Bearer Token| Railway
    Railway --> Laravel
    Laravel --> Auth

    Laravel --> Customer
    Laravel --> Project
    Laravel --> Task
    Laravel --> Meeting

    Customer --> DB
    Project --> DB
    Task --> DB
    Meeting --> DB

    Laravel --> AIService

    AIService --> Demo
    AIService --> OpenAI
```

## Domain構成

主なDomainの関連は以下です。

```text
User
 └─ Customer
      └─ Project
           ├─ Task
           └─ Meeting
```

TaskやMeetingに直接`user_id`を持たせるのではなく、Project → Customer → Userの関連から所有権を判定する構成にしています。

これにより、異なるUserのCustomer / Project / Task / MeetingへアクセスできないようAPI側で制御しています。

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Lucide React
- App Router

### Backend

- PHP 8.3
- Laravel 13
- Laravel Sanctum
- Laravel Pint
- PHPUnit

### Database

- PostgreSQL
- SQLite `:memory:` for automated tests

### AI

- OpenAI Responses API
- Structured Outputs
- Demo AI Provider
- Provider abstraction

### Development / Operations

- Git
- GitHub
- GitHub Actions
- Dependabot
- Vercel
- Railway
- WSL2
- Ubuntu 24.04 LTS

## Deployment

Production環境はFrontend / Backend / Databaseを分離しています。

```text
Browser
 ↓
Vercel
Next.js
https://salesflow-ai-bay.vercel.app

 ↓ Bearer Token

Railway
Laravel REST API
https://salesflow-ai-production-4493ac2e.up.railway.app

 ↓

Railway PostgreSQL
```

### Frontend

- Vercel
- Next.js
- HttpOnly CookieによるAuthentication Token保持
- Next.js Route HandlerによるBackend API Proxy

### Backend

- Railway
- Laravel 13
- Laravel Sanctum Bearer Token Authentication
- Demo Read Only Middleware
- Meeting AI Rate Limit

### Database

- Railway PostgreSQL

Production環境ではMeeting AIにDemo Providerを使用し、外部OpenAI APIの継続的な利用料金が発生しない構成としています。

## Security

Security面では以下の対策を行っています。

- Laravel Sanctumによる認証
- Sanctum Personal Access TokenによるBearer Token認証
- Authentication TokenをNext.js HttpOnly Cookieへ保存
- Browser JavaScriptからTokenへ直接アクセスできない構成
- Next.js Route Handlerを経由したBackend API通信
- Logout時のAccess Token失効
- Login User単位のデータ所有権確認
- Demo AccountのBackend Read Only制御
- Laravel FormRequestによる入力Validation
- OpenAI API KeyのBackend管理
- `.env`によるSecret管理
- AI APIへのRate Limit
- OpenAI Error詳細をClientへ直接公開しないError Handling
- `composer audit`によるPHP Dependency監査
- `npm audit`によるFrontend Dependency監査
- PHP RuntimeおよびDependencyのSecurity Update
- Dependabotによる継続的なDependency Update確認

既知脆弱性が確認された場合には、影響Versionの調査、修正版へのUpdate、Security Audit、Regression Testまで実施する運用としています。

## Automated Tests

LaravelのUnit / Feature Testを実装しています。

現在のBackend Test結果:

```text
104 tests passed
432 assertions
```

主な確認対象:

- Authentication
- Token Authentication
- Token Logout
- Customer API
- Project API
- Task API
- Meeting API
- Dashboard API
- Userごとのデータ所有権
- Demo Read Only制御
- Meeting AI API
- Demo AI Provider
- OpenAI Provider
- OpenAI Error Handling
- AI Feature Disable
- Unsupported Provider
- AI Rate Limit

AI TestではLaravelの`Http::fake()`を使用し、Test実行時に実際のOpenAI APIへ通信しない構成にしています。

## CI

GitHub Actionsを利用してPull Requestおよび`main`へのPush時に自動検証を実行しています。

### Backend CI

```text
composer install
      ↓
composer validate
      ↓
composer audit
      ↓
Laravel Pint
      ↓
Laravel Test
```

### Frontend CI

```text
npm ci
  ↓
npm audit
  ↓
TypeScript
  ↓
ESLint
  ↓
Next.js Production Build
```

Backend / Frontendを独立したJobとして実行し、どちらかに問題があればMerge前に確認できる構成です。

## Dependabot

以下のDependencyをDependabotで定期監視しています。

- Composer
- npm
- GitHub Actions

更新確認は毎週月曜日09:00（Asia/Tokyo）に実行します。

minor / patch Updateはパッケージエコシステム単位でまとめ、major Updateは影響範囲を確認できるよう個別に扱います。

Dependabotによって作成されたPull RequestについてもGitHub Actions CIを実行し、Test・Build・Security Auditを確認してからMergeします。

自動Mergeは使用せず、人間が変更内容とCI結果を確認してからMergeする運用としています。

## Environment Variables

### Backend

AI関連の主な環境変数:

```env
MEETING_AI_ENABLED=true
AI_PROVIDER=demo
MEETING_AI_RATE_LIMIT_PER_MINUTE=5

OPENAI_API_KEY=
OPENAI_MODEL=gpt-6-luna
OPENAI_BASE_URL=https://api.openai.com/v1
```

公開Demoでは以下を使用します。

```env
MEETING_AI_ENABLED=true
AI_PROVIDER=demo
DEMO_READ_ONLY=true
```

OpenAI APIを使用する場合のみ`AI_PROVIDER=openai`へ変更し、Backend環境へAPI Keyを設定します。

Production環境ではDatabaseやApplication KeyなどのSecretをRailway Environment Variablesで管理します。

### Frontend

Local開発環境では以下を使用します。

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

ProductionではVercel Environment VariablesへRailway Backend APIを設定します。

```env
NEXT_PUBLIC_API_BASE_URL=https://salesflow-ai-production-4493ac2e.up.railway.app/api/v1
```

Backend API URLはSecretではありません。

Authentication Token自体はEnvironment VariableやBrowser JavaScriptでは管理せず、Next.jsのHttpOnly Cookieを利用します。

## Local Setup

### Backend

```bash
cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate

php artisan serve --host=localhost --port=8000
```

Database設定については利用環境に合わせて`.env`を設定します。

### Frontend

別Terminalで実行します。

```bash
cd frontend

npm ci

npm run dev
```

Local URL:

```text
Frontend
http://localhost:3000

Backend
http://localhost:8000
```

Local環境でもNext.jsのAuthentication Route Handlerを経由してLaravelのToken Authenticationを利用できます。

Laravel側にはSession / Cookie認証も互換性のため残しています。

## Quality Check

### Backend

```bash
cd backend

composer validate

composer audit

./vendor/bin/pint --test

php artisan test
```

### Frontend

```bash
cd frontend

npm audit

npx tsc --noEmit

npm run lint

npm run build
```

## 工夫した点

### 1. Frontend / Backendの責務分離

Next.jsとLaravelを分離し、FrontendからLaravel REST APIを利用する構成にしています。

ProductionではVercelとRailwayを分離し、実際のFrontend / Backend分離環境で運用しています。

### 2. データ所有権

単にLogin済みか確認するだけではなく、Customer → Project → Task / Meetingの関連を利用し、Login User以外のデータへアクセスできないようにしています。

### 3. 異なるDomain間のAuthentication

VercelとRailwayのように異なるDomainでFrontend / Backendを運用できるよう、Laravel Sanctum Personal Access TokenとNext.js Route Handlerを組み合わせています。

TokenはNext.jsのHttpOnly Cookieへ保存し、Browser JavaScriptへ直接公開しません。

```text
Browser
 ↓ HttpOnly Cookie
Next.js
 ↓ Bearer Token
Laravel API
```

### 4. 公開Demo Dataの保護

公開PortfolioではDemo AccountをRead Onlyにしています。

Frontendだけで操作を無効化するのではなく、Backend MiddlewareでもMutation Requestを拒否します。

これにより、APIへ直接アクセスされた場合でもDemo Dataが変更されないようにしています。

### 5. AIを自動保存しない設計

AIはあくまで営業担当者を支援する提案機能として扱い、AI ResponseをDatabaseへ直接保存しません。

営業担当者自身が内容を確認・修正してから保存します。

### 6. AI APIコストへの対応

公開Portfolioで継続的なOpenAI API利用料金が発生しないよう、Demo Providerを実装しています。

必要な環境ではEnvironment VariableだけでOpenAI Providerへ切り替えられます。

### 7. Securityを開発フローへ組み込む

脆弱性が発見された場合だけ手動対応するのではなく、

```text
Dependabot
     ↓
Pull Request
     ↓
GitHub Actions
     ↓
Security Audit
     ↓
Test / Build
     ↓
Human Review
     ↓
Merge
```

という継続的な運用を構築しています。

### 8. Production Deploymentまで実施

Local開発だけで終わらせず、

```text
GitHub
 ↓
Vercel / Next.js
 ↓
Railway / Laravel
 ↓
Railway PostgreSQL
```

というProduction環境を構築し、実際に公開Demoとして利用できる状態まで運用しています。

## 今後の改善予定

今後は以下を予定しています。

- READMEへの画面キャプチャ追加
- 営業活動タイムライン機能
- Dashboard / Report機能の強化
- Production環境での監視・Logging強化
- E2E Testの導入
- UI / UXの継続的な改善
- AI提案機能の拡張

## About This Project

SalesFlow AIは、Web Applicationの設計・実装だけでなく、Authentication、Test、Security、CI、Dependency Management、AI APIの運用コスト、Production Deploymentまで含めた**個人開発・運用実績**として継続開発しているプロジェクトです。

Frontend / Backend / Databaseを分離した構成を実際に公開環境へDeployし、第三者が確認できるPortfolio Applicationとして運用しています。