#!/bin/zsh
set -e

# GitHub Actions の iOS ジョブ(macOSランナー)廃止後、SwiftLintゲートが
# どこにも残っていなかったため、Xcode Cloud のフックとして復元する。
brew install swiftlint

cd "$CI_WORKSPACE/ios"
swiftlint lint --strict
