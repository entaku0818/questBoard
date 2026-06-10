//
//  Item.swift
//  questBoard
//
//  Created by 遠藤拓弥 on 2026/06/10.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
