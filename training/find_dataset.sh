#!/bin/bash
# Quick dataset finder for the 7600 EXTRA PREMIUM dataset

echo "🔍 Searching for 7600 EXTRA PREMIUM dataset..."
echo "Looking for files with ~7342 lines (megadataset)"
echo "=" * 60

# Common locations to check
LOCATIONS=(
    "/Users/polyversai"
    "/Users/polyversai/mlx_lora_trainer"
    "/Users/polyversai/training"
    "/Users/polyversai/datasets"
    "/Users/polyversai/data"
    "/Users/polyversai/mlx-data"
    "/Users/polyversai/gDriveLibraxis"
    "/Users/polyversai/Downloads"
    "/Users/polyversai/Documents"
)

# Search for JSONL files with approximately the right size
echo "📁 Checking common locations..."
for loc in "${LOCATIONS[@]}"; do
    if [ -d "$loc" ]; then
        echo "  Checking: $loc"
        find "$loc" -name "*.jsonl" -type f -size +1M 2>/dev/null | while read -r file; do
            line_count=$(wc -l < "$file" 2>/dev/null || echo 0)
            if [ $line_count -gt 7000 ] && [ $line_count -lt 7500 ]; then
                echo "    ✅ CANDIDATE: $file (lines: $line_count)"
                # Check for thinking tags
                if grep -q "<think>" "$file" 2>/dev/null; then
                    echo "       🧠 Contains <think> tags!"
                fi
            fi
        done
    fi
done

echo -e "\n📊 Also checking for files with specific keywords..."
find /Users/polyversai -type f \( -name "*7342*" -o -name "*megadataset*" -o -name "*premium*" -o -name "*svetliq*" \) -name "*.jsonl" 2>/dev/null | head -20

echo -e "\n💡 Tip: Once you find the dataset, run:"
echo "   python /Users/polyversai/Codebase/Klaudiusz/libraxis-ai/training/validate_dataset.py <dataset_path>"
echo "   python /Users/polyversai/Codebase/Klaudiusz/libraxis-ai/training/qwen3-thinking-prepare.py <dataset_path>"