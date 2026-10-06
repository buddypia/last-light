# LAST LIGHT — production and acceptance

更新: 2026-10-06 JST。現在の配布版は **GitHub Public公開・法務・セキュリティ・ドキュメント整備完了版（buddypia/last-light）**。実装・自動テスト・実画面・通常入力を下記の範囲で確認。第三者による操作感・楽しさの評価は未実施。

## 2026-10-06 — GitHub Public公開前監査・脆弱性修正・アカウント切り替え（buddypia）

- **アカウントおよび公開先設定**:
  - リモート先を `buddypia/last-light`（GitHub Buddy アカウント `buddypia`）へ設定。
  - SSH 接続設定（`github-buddypia` / `buddypia_rsa`）経由での認証・疎通を確認。
  - `package.json` に `repository`（`https://github.com/buddypia/last-light.git`）、`homepage`、`bugs`、`author: "buddypia"` を追加。
- **公開前セキュリティ監査 & 機密・個人情報（PII）の徹底排除**:
  - 全ソースコード、Git 追跡ファイル、設定ファイルを対象に、APIキー・シークレット・トークン・パスワード・秘密鍵の漏洩がないことを確認。
  - 社内・業務ドメイン（`@cyberagent.co.jp`）、社内アカウント名、内部絶対パス（`/Users/` 等）の露出を完全排除。
  - Git 初期コミットのコミッター・著者を `buddypia <shoridevel@gmail.com>` に統一修正し、不要な業務情報や別アカウント情報の履歴混入を防止。
  - `src/` 内の通信確認: `fetch` / `XMLHttpRequest` / `WebSocket` / 外部ビーコン呼び出しが皆無（0件）であり、100% オフライン・`localStorage` 完結であることを再確認。
- **依存関係の脆弱性監査と修正**:
  - `npm audit` を実行し、`source-map-js`（1.2.1）に報告されていた DoS 脆弱性（GHSA-68fv-2mgg-jv7q）を検知。
  - `source-map-js` を `1.2.2` へ更新し、`npm audit` の脆弱性報告を **0 件**（High: 0, Moderate: 0, Low: 0）に解消。
- **品質・テスト・ビルド検証**:
  - 単体テスト: `npm test` による決定論的シミュレーション 37 テストすべて成功（**37 pass / 0 fail**）。
  - プロダクションビルド: `npm run build`（Vite）正常終了（exit code 0）。
- **著作権・ライセンス適格性**:
  - MIT License（`LICENSE`）および `THIRD_PARTY_LICENSES.md` の整合性を確認。全 3D 形状・Web Audio 合成音・SVG アイコンが完全プロシージャル生成であり、第三者バイナリアセット非依存であることを確認。

## 2026-10-01 — GitHub Public公開・法務・セキュリティ・ドキュメント整備

- **セキュリティ & 機密情報漏洩防止**:
  - 全リポジトリの走査によりAPIキー、アクセストークン、プライベートキー、資格情報の漏洩がないことを確認。
  - `.gitignore` を新設し、`node_modules/`、`dist/`、`.env*`、OS固有ファイル（`.DS_Store` 等）、エディタ設定を追跡除外。
  - `.env.example` を配置し、完全クライアントサイド・外部サービス不要の仕様を明記。
  - `tests/browser-*.js` 内に存在したローカル絶対パス（`/Users/...`）を、実行環境に依存しないポータブルな相対パスへ修正。
  - `SECURITY.md` を作成し、ローカル完結型アーキテクチャ（外部通信ゼロ、LocalStorageによるオリジン分離保存、テレメトリ非収集）および脆弱性報告窓口を明記。
- **ライセンス & 権利関係**:
  - `LICENSE`（MIT License）を新設。
  - `THIRD_PARTY_LICENSES.md` を作成。Three.js（MIT）、Vite（MIT）のライセンス条項および、全3Dメッシュ・Web Audioシンセサイザー音源・インラインSVGアイコンが独自コードによるプロシージャル生成であり、第三者の著作権侵害・バイナリアセット依存がないことを明文化。
  - `package.json` にオープンソースメタデータ（description, license: "MIT", keywords）を明記。
- **リポジトリ公開ドキュメント & コミュニティ健全性**:
  - `README.md` を全面的に刷新。日英バイオグラフィー、バッジ、ゲーム概要、全操作一覧表、サバイバル・クエスト進行ガイド、推奨動作環境、アーキテクチャ解説、プライバシー保証を完備。
  - `CONTRIBUTING.md` を作成。プロシージャル第一主義、シミュレーションと描画の完全分離、テスト駆動、PR手順をガイド。
  - `CODE_OF_CONDUCT.md`（Contributor Covenant v2.1）を新設。
  - `.github/ISSUE_TEMPLATE/`（バグ報告・機能提案）および `.github/PULL_REQUEST_TEMPLATE.md` を配備。
  - `.github/workflows/ci.yml`（Node 20 / 22 による CI テスト・ビルド自動実行）を導入。
- **ゲーム内文章・UIの補完**:
  - タイトル画面およびポーズ画面に「このゲームについて（About & Credits / 操作と仕様）」モーダルダイアログを追加。
  - 物語背景、操作一覧、プロシージャル生成の特徴、オフライン・プライバシー保証、オープンソースクレジットをゲーム内からも即時確認可能に改善。
- **回帰テスト結果**:
  - `npm test`: **37 pass / 0 fail** (所要時間 約0.9秒)。
  - `npm run build`: Vite build exit 0。

## 2026-09-29 — 握り、武器の軌道、狼の動作

目的: 柄を握った手と腕がつながり、斧の刃が前へ下り、槍の穂先が柄の軸に沿って進み、その接触と相手の反応が一致する戦闘・採取にする。既存の青緑のlow-poly島と暖色の道具を維持する。参照基準から、可動部の原点、動きの理由、接地と入力への反応を適用。新しい地域や敵種は追加していない。

### 実装

- `actors.js` に指・親指・手のひら、肘・前腕・袖口のモデルを追加。手を柄の座標に固定し、腕は肩と手首から肘を解く。槍は左手も同じ柄の軸に追従する。装備の引き上げ、歩行の揺れ、採集の手伸ばし、被弾の反動を持つ。
- 石斧は前方を向く刃と柄に巻いた紐を持つ形状に変更。構えでは刃の面を見せ、振りかぶり→前下方への打撃→振り抜き→復帰を行う。槍は柄と穂先の軸を合わせ、両手で引いてから突く。松明と素手も別の動き。
- `motion.js` の接触時点を描画とsimulationで共有。斧は0.34秒、槍は0.27秒で一回だけ判定する。振っている途中の連打・持ち替えを防止。攻撃開始時の道具を保持し、接触時の向き・距離・高さ・遮蔽物を確認する。斧での採取も遅延判定とし、遠ざかった場合は空振り。採取距離を2.4mへ詰めた。
- 一人称の腕と道具を同じFOVの専用描画に移し、地面や木が腕を切り取る問題を避ける。静的な部位を材質ごとにまとめ、動く関節を残す。動き軽減では歩行・視点に伴う揺れを抑え、操作に必要な攻撃は表示する。
- 狼を胴・胸・腰・首・頭・顎・耳・尾・四肢に分割。実移動距離に応じた足運び、膝と足首、地形に合わせた足位置、呼吸、鼻先と耳の小動作を追加。威嚇の屈みと開口、踏み込み、被弾・よろめき、横倒しになる死亡を実装。倒れた体は解体まで残る。
- AIは巡回・停止→追跡→0.65秒の予兆→向きを決めた踏み込み→1.25秒の隙。群れは接近時に横へ分かれ、火や松明から逃げる。移動とノックバックは衝突を確認する。HP64・噛みつき16は保持し、行動と反応を強化した。
- 保存schema v2を維持し、旧記録も読み込む。保存した攻撃を再生して二重加害しない。狼の踏み込み・一回判定の状態を保存。Hと道具の説明を更新。

### 確認結果と証拠

| 確認 | 結果 |
|---|---|
| 回帰テスト | `npm test`: **37 pass / 0 fail**。[log](../evidence/2026-09-29-motion/unit-tests.log)。遅延接触、一回性、持ち替え防止、向き・上下・距離・遮蔽物、採取の空振り、保存再開、刃の前下方移動、槍と両手の軸一致、狼の予兆・横回避・回復・足運び・停止・死亡を確認 |
| ゲームの一周 | 既存の2経路を再実行。資源付与・teleportなしで衝突に沿って移動し、採集・製作・無線・救助まで成功。拡張経路は野営・補給所・灯台も含む。採取距離の変更に合わせ、botが2.2m以内へ歩いてからE相当を呼ぶように変更 |
| 通常速度の入力 | [browser-motion.json](../evidence/2026-09-29-motion/browser-motion.json)、[scenario](../tests/browser-motion.js)。場面準備は診断APIのteleport・狼fixtureを使用。操作は通常速度のE・マウスクリック・Escape・再開ボタン。伐採1回、槍でHP64→30→撃破、Eで回収、途中ポーズと再開を確認。人のプレイテストではない |
| 実画面 | [斧の振りかぶり](../evidence/2026-09-29-motion/chop-windup.png)、[打撃](../evidence/2026-09-29-motion/chop-contact.png)、[槍を引く](../evidence/2026-09-29-motion/spear-load.png)、[両手で突く](../evidence/2026-09-29-motion/spear-contact.png)、[狼の群れ](../evidence/2026-09-29-motion/wolf-pack.png)、[倒れた狼](../evidence/2026-09-29-motion/wolf-defeated.png)。近景で握りと腕の連続性、刃・穂先、関節・口・足運び・死亡姿勢を目視。初期の大きすぎる斧頭、刃の面が隠れる構え、浮いた紐、突き切ったときの両手の近さを修正 |
| 動くフレーム | [live-motion.json](../evidence/2026-09-29-motion/live-motion.json) と `live-spear-*.png`。rAF中の自然な進行を採取し、狼の接近・被弾と手の引き／突き／復帰を確認。初期診断の静止画像は `axe-*` / `wolf-windup.png` 等で、最終確認には上記通常入力の画像を使用 |
| 対象Macの性能 | Apple M4 Max、共有Chrome、high、2320×1329 CSS px、端末DPR2（rendererは1.5で上限）、狼7体。visibleな180連続rAF、mean **16.672ms ≒ 60fps**、p95 **17.5ms**、1286 draw calls / 187,530 triangles。静止meshの統合後に計測。低性能端末や全場面の保証ではない |
| 配布版 | 同じdistを専用port49186で確認。[production-check.log](../evidence/2026-09-29-motion/production-check.log)。診断APIなし、1/2/3の装備、攻撃、ポーズ再開、保存を確認。[斧](../evidence/2026-09-29-motion/production-axe.png)、[槍](../evidence/2026-09-29-motion/production-spear.png)、[松明](../evidence/2026-09-29-motion/production-torch.png)。テストfixtureの燃料0で松明が装備できない正常系も観測後、燃料を持つfixtureで再検証 |
| console / 配信 | 最終productionのconsole error **0**。[console](../evidence/2026-09-29-motion/console-production.log)。4187のHTML・JS・CSSがHTTP200、distとbyte一致。[HTTP記録](../evidence/2026-09-29-motion/production-http.json) |

共有Chromeでは非表示タブのrAFが停止するため、hiddenになった試行を性能・通常入力の証拠には使わなかった。診断用freeze/renderは開発の `?test=1` のみ。静止姿勢の検査はこのAPIとDOMイベント、上表の通常入力検査はvisibleな専用tabとPlaywright入力を使用。canvasのフレームをrAF外で取得した最初の画像は空だったため、rAF中に取得し直して目視した。

最終の小修正は、停止時の狼の足姿勢を保持（unitで確認）、燃料切れの炎を消す、松明の炎が画面上端に切れない構え（productionで目視）。性能計測後の修正であり、戦闘中の描画構成は同じ。37 testsとproduction操作は最終buildで再実行した。

### 配布buildと最終チェック

- `dist/assets/index-xB7Vwmz2.js` / `index-zUJiSo00.css`。JS **630.80 kB / gzip 175.21 kB**。Three.jsを含む500 kB超のVite通知は継続。追加dependency・外部アセット・APIなし。
- JS SHA-256: `d50f73f19d3453d5e87094d92bf10215bc8de6161a2cc3195d5bc6a1c29dce24`。[全hash](../evidence/2026-09-29-motion/build-sha256.txt)、[build log](../evidence/2026-09-29-motion/build.log)。rootにGit repositoryはない。
- [配布先4187](http://127.0.0.1:4187/)を更新済み。既存ユーザーtabは操作せず、通常の保存keyにも書き込んでいない。専用tab `PW_AGENT_SESSION_ID=llmot29_arms` は `close-test` 済み、専用49186 serverは停止済み。
- 共通最終チェック: low-polyの美術方針、道具と狼の輪郭・近景、木／石／肌／毛の面と明暗、接地、動作と接触の因果、中心の照準、伐採と戦闘の一周、保存・ポーズ再開、連打と回避、実機性能を上の証拠で確認。静止画だけで操作性を判断していない。
- Self-review: 変更したsimulation・描画・入力・保存・説明を見直し、消費と加害の一回性、旧記録の読込、骨格の親子関係、描画負荷を検証。未評価は第三者の理解・操作感・難易度の満足度、長時間の耐久、低性能端末、全地形での足の接地。写実的な解剖精度や人による遊びやすさの評価は主張しない。

## 直前の拡張版の記録（履歴）

以下のbuild識別・件数・性能は、その版の日時の記録であり、今回の配布版の値ではない。

更新: 2026-09-29 JST。現在の配布版は **世界観・クエスト・製作案内の拡張版 / 検証済み**。実装、テスト、作者による実画面確認と、人による初見の理解・楽しさの評価は区別する。第三者のプレイテストは未実施。

## 2026-09-29 — 手帳と島の物語の拡張

ユーザーの「斧や槍の作り方がわからない」を起点に、素材を見分ける→入手場所を探す→Eで採集→Cで製作→装備して使う、という流れをゲーム内で説明する。青緑の島と暖色の道具・灯りという既存の美術方針を維持し、手帳には読みやすい図解、記録には紙の色を使う。

実装した範囲:

- 初回の物語と3段階の操作案内。Cの製作画面には道具・素材の図、必要数・所持数・不足数、採り方、用途、道具不要の初期採集を常時表示。作業台不要と明示。
- 未所持の1/2/3を押すと該当の製作方法を開く。「?」をhover・focus・クリックで表示し、Hの手引きにも同じ説明を載せる。Escapeはまずツールチップを閉じる。
- Jの主目標5章（斧、槍と松明、火と水、3部品、救助）と寄り道3件（灯台、屋根と集水器と休息、記録回収）。達成済み手順は素材消費後も保持する。所持済みの一意道具は製作追跡できず、保存済みの古い追跡も解除する。
- 選択した素材の近い採集地点、次の探索地点を方角・距離・3Dの目印で案内。枯渇した採集地点は除外。地図と未発見の記録から目的地を選べる。
- 西の補給所と北岬の灯台。補給は金属片3・包帯1・木の実3を一度だけ受け取る。灯台は初回Eで調査、以後Eで木材6・金属片3を使って復旧。灯が戻り、肉2・包帯1、救助待機90→60秒。修理のための遠回り・素材消費と、待機時間短縮の選択が生まれる。
- ミオ、レン、ソウ、ナギ、エダの記録。最初の手帳1頁と、現地で見つける5冊。各部品や灯台の用途を物語の中で説明し、発見数と灯台の状態を帰還画面にも表示。
- セーブschema v2。v1の資源配置・持ち物・進行を保持し、元のraw記録を `last-light-save-v1-before-journal` に保存。新設建物と重なった旧プレイヤー・旧建築だけを近くの有効な場所へ移す。開発用 `?test=1` は通常とは別の保存・設定key。

### 今回の配布版

- production: `dist/assets/index-CTwNL9p3.js` / `index-zUJiSo00.css`。
- JS SHA-256: `672ecceba52e2f2d1924e060d35a43a8306ec72dee305e8cdffde03d1f6ccf02`。
- 616.05 kB / gzip 169.74 kB。既存のThree.jsを含む500 kB超のVite通知は継続。追加dependency、外部アセット、外部APIはない。
- [配信版](http://127.0.0.1:4187/) は更新済み。HTML・JS・CSSのHTTP 200とdistとのbyte一致を [production-http.json](../evidence/2026-09-29-expansion/production-http.json) で確認。ユーザーの既存タブは操作していない。
- 全ソース・buildのhash: [build-sha256.txt](../evidence/2026-09-29-expansion/build-sha256.txt)。rootにGit repositoryがないためcommit IDはない。

### 確認結果

| 確認 | 結果 / 証拠 |
|---|---|
| simulationと互換性 | `npm test`: 29 pass / 0 fail / 0 skip、約0.77秒。[log](../evidence/2026-09-29-expansion/unit-tests.log)。新旧経路、クエスト保持、補給・修理の一回性、不正手帳拒否、旧配置の移行、所持済み製作の行き止まり防止、実際の夜間休息まで含む |
| 経路と必要資源 | 初期状態から資源付与・teleportなしで、衝突に従って739 m移動。斧・槍・松明・焚き火、補給所、灯台、3部品、泉、無線、救助まで完走。health100、game elapsed246.41秒。高速計算のbotで、人の所要時間ではない |
| ブラウザ操作 | [browser-quests.log](../evidence/2026-09-29-expansion/browser-quests.log): 素材のE採集、斧・槍・松明の製作、未所持2の導線、ツールチップfocusとEscape、補給、灯台、保存・再開。移動短縮に開発用teleportを使用し、素材付与は使っていない |
| 拡張後の一周 | [browser-finish.log](../evidence/2026-09-29-expansion/browser-finish.log): 焚き火をクリック設置、泉と3部品、全5冊、60秒の救助開始と終了、主目標5章＋寄り道2件完了。救助時間は診断APIで早送り。拠点づくりの寄り道はunitで建築→安全な夜の休息→保存を確認 |
| 初期説明・製作の画面 | [初回](../evidence/2026-09-29-expansion/01-arrival.png)、[素材の図解](../evidence/2026-09-29-expansion/02-crafting.png)、[ツールチップ](../evidence/2026-09-29-expansion/03-tooltip.png)、[槍](../evidence/2026-09-29-expansion/17-production-spear.png)。図、必要数、素材の形、E採集、製作ボタン、用途を目視確認 |
| 島の描画 | [補給所](../evidence/2026-09-29-expansion/07-outpost.png)、[灯台の昼](../evidence/2026-09-29-expansion/10-lighthouse-day.png)、[復旧した夜の灯](../evidence/2026-09-29-expansion/12-lighthouse-light.png)。屋根・開口部・柱、棚・手紙、塔の縞・灯室・手すり、海岸の接地と役割を目視確認。新設建物に草が貫通する配置を修正。最初の夜の撮影位置は樹冠が灯室を隠したため、通常に歩ける別の視点でも確認 |
| 記録・地図・終了 | [手帳](../evidence/2026-09-29-expansion/08-island-records.png)、[地図](../evidence/2026-09-29-expansion/09-map.png)、[救助の帰還記録](../evidence/2026-09-29-expansion/16-rescue-record.png) |
| 小さめのdesktop | [800×650](../evidence/2026-09-29-expansion/14-small-desktop.png)。dialog内clientWidth750 / scrollWidth750、下端617.5px。縦スクロールで内容へ到達し、横にはみ出さない。タッチ対応を意味しない |
| 実機性能 | このMac（Apple M4 Max）の共有Chrome、1440×900、DPR1、灯台付近の夜、180連続rAF interval。mean16.672ms（約60fps）、p9518.4ms、drawCalls89 / triangles89,698、document.hidden=false。全場面・低性能端末の保証ではない |
| 配布build | `npm run build`: exit0、約0.61秒。[log](../evidence/2026-09-29-expansion/build.log)。通常データ保護のため、同じdistの別origin4188で [production操作](../evidence/2026-09-29-expansion/browser-production.log) を確認。診断APIなし、W/矢印/Eで木材2取得、案内・槍の画面・8クエスト・保存成功 |
| 配布版での旧記録移行 | [browser-migration.log](../evidence/2026-09-29-expansion/browser-migration.log)。テストoriginで旧schemaのfixtureを読ませ、旧位置(-45,-67)から安全な(-45,-63.5)へ補正、工具保持、raw backup一致、通常W入力で移動成功。unitは保存した実v1実装を使用 |
| console・通信 | [console](../evidence/2026-09-29-expansion/console.log) にChrome拡張のruntime.lastError・chrome-extensionのuseCacheエラー。アプリasset由来の例外は観測なし。detachでnetwork記録範囲が変わるため、[requests](../evidence/2026-09-29-expansion/requests.log) に加えresource timingと上記HTTP byte比較を使用 |

ブラウザは同じ `PW_AGENT_SESSION_ID=llquest29_expansion` の専用test tabのみ。共有Chromeでタブがhiddenになった試行は入力・性能の証拠にせず、detach→再attachで自身のタブのfocusを回復して検証した。完了後 `close-test`。検証用4188サーバーは停止し、ユーザー向け4187は継続。

### 最終レビュー — Deep / Self-review: same session

Project profile: local desktop browser、JS/Three.js/Vite、localStorage、バックエンド・認証・課金・個人データ・外部APIなし。house rulesはrootとlocalのAGENTS、[品質基準](../../docs/CREATIVE_QUALITY_STANDARD.md)、[制作手順](../../docs/CREATIVE_WORKFLOW.md)。manifestのtest/buildを使用し、存在しないlint/typecheckは作っていない。scopeは上記の実装とそのテスト・文書。保存の読込、製作、HUD、描画、終了表示が主な影響先。

独立した2名の初回レビューで、旧位置が新設collision内になる問題と、所持済み道具を再追跡できる問題を発見。修正とregression追加後、履歴を共有しない別の2名で再レビューし、ともに **PASS**。追加probeでは救助残り41秒で灯台を修理しても時間を増やさないこと、全3道具の古い追跡解除、prototype名など不正ID拒否、複数の旧建築位置の移行も確認。

| Dimension | 判定と根拠 |
|---|---|
| D1 intent | 製作の理解→操作、物語→探索、クエスト→結果をコードと実UIに対応づけた |
| D2 logic | 採集・製作・装備・設置・記録・補給・修理・救助の順序と分岐をunit/UIで検証 |
| D3 edges | 不足、枯渇、重複、保存後の再操作、未知ID、所持済み工具、旧collisionを検証 |
| D4 evidence | 29 tests、実入力、実画面、配布byte比較。人の初見評価は未実施 |
| D5 security | 新しいHTML出力は固定content、検証済みID・数値。診断APIはproductionにない |
| D6 privacy | N/A: 新たな個人情報、ログ送信、解析通信なし |
| D7 dependencies | N/A: dependency変更なし。既存lockfileを使用 |
| D8 performance | 誘導は有限の170資源と8クエスト。180フレーム実測。追加の固定scene modelに上限あり |
| D9 integrity | 同期処理、報酬の二重取得なし、追跡と進行は保存。共有backendなし |
| D10 reliability | v1を原文でbackup、移行失敗は既存の読込エラー導線、テスト保存を分離 |
| D11 ROI | 既存simulation/描画を使用。新しいengineやquest framework、外部サービスを追加しない |
| D12 compatibility | 実v1の資源・所持品・状態を移行し、重なる配置だけ補正。旧APIの既存testsもpass |
| D13 UX/DX | 日本語、keyboard tooltipと閉じ順、800px手帳、初期説明、READMEとこの記録を更新 |

Adversarial check: 説明不足は実際のユーザー報告であり変更が必要。文章だけを増やす案も評価したが、素材が見つからない問題には図と対象案内が必要と判断した。汎用quest engineは採らず、固定8件の条件に留めた。今回削っても同じ動作になる中間frameworkは加えていない。島の戦闘難度・全体の遊びの長さは今回再設計しておらず、その前提は人のプレイテストで検証が必要。

Verdict: **Go**。未解決のCRITICAL/HIGHは0。制約は、第三者による初見の理解・操作感・楽しさ、長時間の耐久、低性能端末、タッチ操作が未評価であること。自動完走をこれらの代替としない。

### 共通品質基準の最終チェック

美術方針、通常距離の輪郭と近景、素材と接地、灯台修理と点灯の因果関係、採集と製作の導線、救助と保存再開、補給・灯台のリスクと見返り、対象Macでの操作と性能を確認した。参照の「大小の構造・接地・入力への反応」を継承し、草の貫通と案内の行き止まりを修正。写実性や参照作品と同じ画作りを主張しない。人の理解・所要時間は未評価と記録した。

NO UNRESOLVED DECISIONS

## 拡張前の受け入れ記録（履歴・再検証を意味しない）

以下は2026-09-29の初回配布版の記録を保持したもの。build名・性能・テスト件数は当時の値で、現在の拡張版には上の識別と証拠を使う。


更新: 2026-09-29 JST。状態: **VERIFIED — デスクトップ版の実装・配布build・下記の受け入れを確認**。第三者の人による操作感・楽しさの評価は未実施。

## 体験と範囲

孤島で採集・製作・野営をしながら生存し、座礁船・採掘跡・気象観測所から部品を回収し、丘の無線塔を修理して救助を呼ぶ、オリジナルの一人称3Dサバイバルゲーム。死亡、やり直し、保存・再開、ポーズ、設定まで含む。対象はこのMacのデスクトップChrome、キーボード・マウス。タッチ・マルチプレイは対応をうたっていない。

美術方針: 青緑の針葉樹の島に、風化した黄土色の野営道具と暖かな火を置く、意図的なlow-poly表現。参照の採用は [共通品質基準](../../docs/CREATIVE_QUALITY_STANDARD.md) と [観察記録](../../docs/CREATIVE_REFERENCE_OBSERVATIONS.md) の、大小の構造、種別ごとの輪郭、接地・素材差・導線。参照画像・モデルは複製していない。形状、UI用標識texture、音はソース内で生成する。

## 配布版の識別

- [README](../README.md): 起動・操作・実装の案内。
- production: `dist/assets/index-BG3WPHjQ.js`、`index-cV18TdOL.css`。
- JS SHA-256: `0e4a9b2edc81cf79f6f2ecd38e9cce9729ba217c95021c521d00c14ea11b9673`。
- ソースとbuildの全hash: [build-sha256.txt](../evidence/build-sha256.txt)。workspace rootはGit repositoryではないためcommit IDは存在しない。
- `http://127.0.0.1:4187/` で配布buildを配信。HTML・JS・CSSのHTTP 200と、ディスク上のdistとのbyte一致を [production-http.json](../evidence/production-http.json) で確認。
- Node 22.22.1 / Three.js 0.180.0 / Vite 7.3.6。生成JS 581.05 kB / gzip 157.28 kB。外部アセット・API・CDN・広告・解析通信なし。

## 要件と証拠

| 要件 | 現在の実装・確認結果 | 主な証拠 |
|---|---|---|
| 開始、目的、操作、読込・失敗時の回復 | 日本語title、最初の採集目標、キー案内、読込表示、WebGL初期化失敗時の再読込案内 | `index.html`, `src/main.js`; [production-title](../evidence/production-title.png) |
| 島、道、ランドマーク、道具・獣 | 起伏・海・森林・道標・座礁船・坑口・観測所・無線塔。木、岩、布、金属、水、火を区別 | `src/world.js`; [船](../evidence/wreck.png)、[観測所](../evidence/station.png)、[獣](../evidence/wolf-encounter.png)、[地図](../evidence/map.png) |
| 移動、視点、ジャンプ、衝突 | WASD、マウス固定/ドラッグ/矢印、Shift、Space。木、岩、建築の壁、海岸の巨岩、廃墟を衝突に反映 | `browser-smoke.js`, `browser-production.js`, 衝突unitと`traversal.test.js` |
| 採集・枯渇・再採集 | 小枝/石/繊維/木の実/金属、石斧で伐採・採掘。取得範囲とcooldown、二重取得防止、一部資源再生 | unit、ブラウザのEキー; [production-arrival](../evidence/production-arrival.png) |
| 製作と道具 | 石斧、槍、松明、包帯。素材不足・重複道具を拒否。攻撃stamina、松明180秒と木材による補充 | unit、レシピbutton、[crafting](../evidence/crafting.png) |
| 野営 | 焚き火・シェルター・集水器。設置preview、回転、衝突/傾斜/重複拒否、取消時は未消費。上限24基/焚き火4基 | unit、実UIで3種類を設置; [preview](../evidence/build-preview.png)、[first-camp](../evidence/first-camp.png) |
| 調理・休息・水 | 生肉を調理、Qで食事、泉/集水器で水筒補充、Fで飲む、夜の休息で朝へ。休息に食料・水を消費、敵接近中は拒否 | `browser-expedition.js`、unit; [休息後](../evidence/dawn-after-rest.png) |
| 生存・天候 | 体力、空腹、渇き、体温、持久力、再生・包帯、昼夜・雨、海での冷えと損傷 | unit; [夜](../evidence/night-camp.png)、[雨](../evidence/rain-camp.png) |
| 狼 | 徘徊・追跡・予兆・攻撃・待機・怯み・死亡・解体。後退回避、槍の間合い、火/有限の松明で回避 | 被弾/回避/攻撃連打のunit、ブラウザ2打で撃破・解体・調理 |
| 探索・救助 | 全3地点をEで回収、素材を消費して無線修理、90秒の待機、救助エンディング | `browser-expedition.js`; [signal-sent](../evidence/signal-sent.png)、[rescue-ending](../evidence/rescue-ending.png) |
| 連続した経路 | 初期状態から資源を追加せず、teleportせず、通常の移動速度と衝突判定で569 m歩いて3地点と無線塔に到達。生存し救助まで完走 | `traversal.test.js`; [unit-tests.log](../evidence/unit-tests.log): health100、game elapsed233.88秒。計算を高速実行したbotの値で、人の所要時間ではない |
| 保存、死亡、再開、やり直し | 20秒auto-saveと手動保存、全持ち物/資源/建築/狼/進行復元、終了時に直前の生存記録を保持。新規開始は上書き確認 | `browser-smoke`, `browser-recovery`, `browser-production`; [死亡](../evidence/death-ending.png)、[recovery-state](../evidence/recovery-state.log) |
| 停止と設定 | ポーズ/手帳ではsimulation停止。音量、感度、描画品質、視点揺れ抑制。設定保存、ミュート・品質変更・揺れ設定をUIで確認 | `browser-ending.js`の設定/保存部分、[recovery-state](../evidence/recovery-state.log)。音色の第三者聴取評価は未実施 |
| 壊れた保存の回復 | schema/数値/範囲/資源IDを検査し不正データを拒否。壊れたJSONを実際に読ませるとエラー案内、titleに残る。元のテスト記録を復元 | restore unit、`corrupt-save-recovery.log`。alertは「記録を読み込めませんでした…新しく始めることはできます。」を確認 |
| 配布build | production URLで通常の歩行・矢印による視点・E採集・材料不足・Tab focus・保存/再開を確認。開発診断APIが存在しない | [browser-production.log](../evidence/browser-production.log)、[production-resources](../evidence/production-resources.log)、HTTP byte比較 |

## 検証コマンドと結果

実行場所 `last-light/`:

| コマンド | 結果 |
|---|---|
| `npm test` | 16 tests pass / 0 fail / 0 skip、約0.43秒。logは上記リンク |
| `npm run build` | exit 0、Vite 7.3.6、約0.57秒。bundleが500 kB超というVite通知のみ。Three.jsを含む本体157.28 kB gzipを許容。遅延読込で初期の必要機能を分割していない |
| `npm audit --json` | 0 vulnerabilities。[audit](../evidence/dependency-audit-all.json)。初回に検出されたViteの修正版を適用済み |

ブラウザ操作はworkspace rootから、同じ `PW_AGENT_SESSION_ID=lastlight_28_survival` と `pw-agent` の専用test tabだけを使用。`browser-smoke.js` → `browser-expedition.js` → rescue状態確認 → `browser-recovery.js`、加えてproduction smokeを実行。ブラウザシナリオの移動短縮用teleportや天候/時間の診断操作は、通常プレイの証拠としていない。**通常入力と描画の確認、simulationの全経路テスト、人のプレイテストは別物**。

共有Chromeで別タブにfocusが移ると `document.hidden=true` となり、rAFが停止することを観測。入力テストの一部と最初の性能待ちはこの状態で止まった。テストタブの再attachで自動focusを回復し再検証した。`browser-ending.js`全体の初回実行はこの環境理由で中断したため、単体成功とは記録しない。その後、実時間の残りカウントで `mode=won`、救助画面、死亡・保存からの復帰を別に確認した。

ConsoleにはChrome拡張の `runtime.lastError`、`chrome-extension://…/content.js` の接続/キャッシュエラーが出た。ゲームのソース・配布assetに由来する例外は観測していない。再attachでネットワークの記録範囲が変わるため、読み込み成功はresource timingとHTTP/byte比較も併用した。WebGL contextの喪失を強制する検証は未実施。

## 性能

Mac16,5 / Apple M4 Max / Chrome 153。高品質（DPR上限1.5、2048 shadow map）で測定。

- 救助場面: CSS viewport 2320×1329、239 rAF間隔、平均16.736 ms（約59.75 fps）、p95 18.5 ms、最大31.8 ms。測定は可視のtest tabで行い、非表示から最初のframeまでの待ち時間を除外。[ログ](../evidence/rescue-performance-interrupted.log)（外側のシナリオが中断した後、page内の測定は可視状態で完了）。
- 配布版の180-frame測定: 1440×900 / DPR1、平均16.667 ms（60fps）、p95 17.6 ms、最大17.7 ms。[production-performance.log](../evidence/production-performance.log)。title上の環境描画の測定であり、戦闘の測定とは区別する。
- 旧初期sceneで約317 draw calls / 68k triangles、樹形改善後は約93k triangles。instanced trees/grass、資源再描画は状態変更時、敵は最大7体、建築は24基・焚き火4基まで。別GPUやタッチ端末の性能は未確認。

## 美術・体験の自己レビュー

- 最初の滑らかな円錐の木を、段ごとに揺らいだ枝葉の輪郭に変更。地面の尖ったcone草をbladeに変更。焚き火・布の屋根・木組み・金属柱・船の船室/甲板/手すりは階層を持つ。
- 最初の浮いた薪の切断面を修正。座礁船を内陸から海岸へ移動。坑口の背後の岩を後退し、入口を圧迫する形を改善。放棄された野営地は屋根を崩した形にし、新設した使用可能なシェルターと区別した。
- 照準HUDがクリックを遮る不具合、Escでポーズが即閉じする不具合を、実操作で再現して修正。マウス固定を拒否された場合もドラッグとクリック攻撃/設置、矢印視点を使用可能にした。
- 参照の住宅ほど精密な建材/家具、Abyssalほど滑らかな生体表現は目指していない。通常距離で木・狼・道具・地点を判別するlow-poly世界として評価。近景の獣の耳・鼻・足、建物の柱・屋根・開口、夜の暖色の火と寒色の森を実画面で確認した。
- 主な判断: 装備とstaminaを使って戦うか、有限の松明/薪で避けるか。近場の採集と野営に投資するか、部品探索を急ぐか。休息前に水・食事を確保できているか。連打cooldown・不足素材・重複採集・予兆の回避を反例として確認。
- 人の初見理解・迷い・楽しさ・実際のプレイ時間は**未評価**。独立reviewerによる評価ではなく、作者の実画面確認と自動検証である。

共通の最終チェック: 美術方針、通常距離/近景の輪郭、素材/接地/奥行き、入力と動き、カメラ/導線/UI、主要循環と復帰、判断と反例、対象端末の実測、具体的な参照差と改善を確認。人の操作感の項目は上記のとおり未評価として明示し、完成の根拠に置き換えていない。

## Final review — Standard / self-review

Profile: Three.js + vanilla JS/CSS、client-only desktop game。localStorage保存、認証/課金/DB/外部APIなし。CIなし、ローカル配布。house rulesは `../AGENTS.md` と共有quality standard。「終了コード0だけで視覚品質を合格にしない」「通常操作と自動検証を分ける」に従った。

| 観点 | 点検 |
|---|---|
| D1 Intent | 生存・製作・建築・探索・戦闘・救助と再開を要件表へ対応 |
| D2 Logic | 資源収支、攻撃cooldown、雨/夜、sleep、端状態、全経路を追跡 |
| D3 Failure | 不足素材、二重取得、無効設置、枯れた燃料、水0、死亡、壊れた保存、マウス固定拒否 |
| D4 Evidence | simulation16件、実UIの操作・画面・production起動、未評価の人の体験を区別 |
| D5 Security | 保存入力を検査、既知inventory keyだけを表示、診断APIはproductionに不在。外部入力/サーバー権限境界なし |
| D6 Privacy | PII・tracking・外部送信なし。端末内のゲーム記録のみ |
| D7 Dependencies | 固定versionとlockfile。Vite修正版適用後audit 0 |
| D8 Performance | 実測、instance描画、敵/建築上限、retryで動的geometry/material解放 |
| D9 Integrity | 同期処理、素材消費は設置成功時、重複part回収拒否。別タブ間の同時プレイ保存競合は対象外 |
| D10 Reliability | 自動/手動保存、破損時の案内、WebGL初期化の回復案内、HTTP配布とhash確認 |
| D11 Cost/ROI | 外部サービス費用なし。エンジン/アセット生成/ルール/UIを必要な4モジュールへ分離 |
| D12 Compatibility | 初回配布save version1。対象Chromeで確認。既存の別作品への依存なし |
| D13 UX/DX | 日本語目標と手帳、keyboard focus、設定・pause・復帰、README起動経路 |

見つけた機能上の問題（HUD遮蔽、Esc、pointer-lock fallback、地形装飾の衝突、無限の松明、retry時のGPU資源解放）は修正・影響範囲を再確認済み。残る制約は人のplaytest、他GPU/ブラウザ、聴覚上の音の評価、強制WebGL context lossであり、対応済みとは表示しない。

必要性: 既存workspaceにサバイバル作品がなく、新規実装が必要だった。より単純な選択: backend/外部assets/汎用entity frameworkを導入せず、固定島と純粋simulationを使用。削除しても製品挙動が変わらないもの: 開発専用診断・証拠用スクリプト（配布版からは除外）。問い直していない前提: デスクトップ一人用のオリジナル作品という解釈。ユーザーは別の題材・エンジンを指定していない。

判定: **Go（上記デスクトップ範囲）**。未解決のCRITICAL/HIGH: 0。16 tests / build / audit / production smoke pass。技術的な完了を、第三者が楽しいと感じることの証明にはしない。

NO UNRESOLVED DECISIONS
