//
//  Models.swift
//  questBoard
//
//  Firestore `users/{uid}` ドキュメントに対応するデータモデル。
//  Web版(Next.js)と同一ドキュメント・同一キーを共有するため、
//  フィールド名・値はWeb版の実装に厳密に合わせている。
//  （詳細スキーマ: docs/NATIVE-APP-PLAN.md §2）
//
//  ※ Firebase非依存。FirebaseFirestore のCodableデコードでそのまま使える。
//

import Foundation

// MARK: - users/{uid} ドキュメント全体

/// Firestore `users/{uid}` の中身。
/// 例: { bucketList: [...], pyramid: {...}, updatedAt: 1736400000000 }
struct UserData: Codable {
    var bucketList: [BucketItem]
    var pyramid: PyramidData
    /// epoch ミリ秒（Web版は Date.now() で書き込む）
    var updatedAt: Double

    init(bucketList: [BucketItem] = [], pyramid: PyramidData = .init(), updatedAt: Double = 0) {
        self.bucketList = bucketList
        self.pyramid = pyramid
        self.updatedAt = updatedAt
    }

    // Firestore側でフィールド欠落があっても落ちないようデフォルトで補完
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        bucketList = (try? c.decode([BucketItem].self, forKey: .bucketList)) ?? []
        pyramid = (try? c.decode(PyramidData.self, forKey: .pyramid)) ?? .init()
        updatedAt = (try? c.decode(Double.self, forKey: .updatedAt)) ?? 0
    }
}

// MARK: - やりたいことリスト（bucketList）

struct BucketItem: Codable, Identifiable, Hashable {
    var id: String
    var title: String
    var category: String   // BucketCategory のrawValue（Web互換のためStringで保持）
    var deadline: String   // "YYYY-MM-DD" 等。未設定時は空文字
    var notes: String
    var status: String     // BucketStatus のrawValue
    var createdAt: String
    var actions: [BucketAction]?

    init(id: String = UUID().uuidString,
         title: String,
         category: String = BucketCategory.other.rawValue,
         deadline: String = "",
         notes: String = "",
         status: String = BucketStatus.notStarted.rawValue,
         createdAt: String = "",
         actions: [BucketAction]? = nil) {
        self.id = id
        self.title = title
        self.category = category
        self.deadline = deadline
        self.notes = notes
        self.status = status
        self.createdAt = createdAt
        self.actions = actions
    }
}

/// 各やりたいことにぶら下がる小タスク
struct BucketAction: Codable, Identifiable, Hashable {
    var id: String
    var text: String
    var done: Bool

    init(id: String = UUID().uuidString, text: String, done: Bool = false) {
        self.id = id
        self.text = text
        self.done = done
    }
}

// MARK: - 目標ピラミッド（pyramid / MVPではv1.1。スキーマ互換のため型は用意）

struct PyramidData: Codable, Hashable {
    var dream: [PyramidItem]
    var goal: [PyramidItem]
    var task: [PyramidItem]

    init(dream: [PyramidItem] = [], goal: [PyramidItem] = [], task: [PyramidItem] = []) {
        self.dream = dream
        self.goal = goal
        self.task = task
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        dream = (try? c.decode([PyramidItem].self, forKey: .dream)) ?? []
        goal = (try? c.decode([PyramidItem].self, forKey: .goal)) ?? []
        task = (try? c.decode([PyramidItem].self, forKey: .task)) ?? []
    }
}

struct PyramidItem: Codable, Identifiable, Hashable {
    var id: String
    var text: String
}

// MARK: - 補助 enum（表示・入力用。Web版の固定値に対応）

enum BucketStatus: String, CaseIterable {
    case notStarted = "未着手"
    case inProgress = "進行中"
    case done       = "完了"
}

enum BucketCategory: String, CaseIterable {
    case travel     = "旅行"
    case study      = "学習"
    case experience = "体験"
    case create     = "創作"
    case health     = "健康"
    case other      = "その他"
}

extension BucketItem {
    /// 不正・未知の値なら nil。表示側でフォールバックする。
    var statusEnum: BucketStatus? { BucketStatus(rawValue: status) }
    var categoryEnum: BucketCategory? { BucketCategory(rawValue: category) }
    var isDone: Bool { status == BucketStatus.done.rawValue }
}
