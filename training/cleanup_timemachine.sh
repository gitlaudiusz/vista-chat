#!/bin/bash
# Time Machine Local Snapshots Cleanup Script
# Te czary-mary mogą zwolnić DUŻO miejsca!

echo "🧹 Time Machine Local Snapshots Cleanup"
echo "======================================="

# List current snapshots
echo "📋 Current snapshots:"
tmutil listlocalsnapshots /

echo ""
echo "💾 Current disk space:"
df -h | grep -E "disk3s1s1|Filesystem"

echo ""
echo "🗑️  To delete ALL local snapshots, run:"
echo "sudo tmutil deletelocalsnapshots /"

echo ""
echo "🎯 Or delete specific snapshots:"
for snap in $(tmutil listlocalsnapshots / | grep "com.apple.os.update"); do
    echo "sudo tmutil deletelocalsnapshot / $snap"
done

echo ""
echo "⚡ Pro tip: Sometimes you need to disable/enable Time Machine:"
echo "sudo tmutil disable"
echo "sudo tmutil enable"

echo ""
echo "🔍 Check purgeable space:"
diskutil apfs list | grep -A5 "Container disk3"