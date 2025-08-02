#!/bin/bash
# 🚀 MASTER LAUNCH SCRIPT FOR QWEN3-30B-A3B-THINKING-2507
# Perfect setup for flight-duration training JAK DLA DANII!
# Just run this when the model finishes downloading!

echo "🧠 QWEN3-30B-A3B-THINKING-2507 TRAINING LAUNCHER"
echo "================================================"
echo "Start time: $(date)"
echo ""

# Configuration
DATASET_PATH="${1:-}"  # Pass dataset path as first argument
MODEL_BASE_PATH="/Users/polyversai/.lmstudio/models"
MODEL_NAME="Qwen3-30B-A3B-Thinking-2507"
TRAINING_DIR="/Users/polyversai/training_runs/qwen3_thinking_$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Find dataset if not provided
if [ -z "$DATASET_PATH" ]; then
    echo -e "${YELLOW}📂 No dataset path provided. Searching for 7600 PREMIUM dataset...${NC}"
    
    # Run finder script
    bash /Users/polyversai/Codebase/Klaudiusz/libraxis-ai/training/find_dataset.sh
    
    echo -e "\n${RED}Please provide dataset path:${NC}"
    echo "Usage: $0 <path_to_7342_entry_dataset.jsonl>"
    exit 1
fi

# Step 2: Validate dataset
echo -e "\n${GREEN}✓ Step 1: Validating dataset...${NC}"
python3 /Users/polyversai/Codebase/Klaudiusz/libraxis-ai/training/validate_dataset.py "$DATASET_PATH"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Dataset validation failed!${NC}"
    exit 1
fi

# Step 3: Check if model is ready
echo -e "\n${GREEN}✓ Step 2: Checking for Qwen3 model...${NC}"
MODEL_PATH="$MODEL_BASE_PATH/$MODEL_NAME"

if [ ! -d "$MODEL_PATH" ]; then
    echo -e "${YELLOW}⚠️  Model not found at: $MODEL_PATH${NC}"
    echo "Waiting for download to complete..."
    echo ""
    echo "Looking for model in common locations:"
    find "$MODEL_BASE_PATH" -name "*qwen*30b*" -type d 2>/dev/null | head -5
    echo ""
    echo -e "${RED}Please update MODEL_PATH when download completes!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Model found at: $MODEL_PATH${NC}"
fi

# Step 4: Prepare training data
echo -e "\n${GREEN}✓ Step 3: Preparing training data...${NC}"
mkdir -p "$TRAINING_DIR"
python3 /Users/polyversai/Codebase/Klaudiusz/libraxis-ai/training/qwen3-thinking-prepare.py "$DATASET_PATH"

# Move prepared data to training directory
if [ -d "/Users/polyversai/training_runs/qwen3_thinking_"* ]; then
    latest_prep=$(ls -td /Users/polyversai/training_runs/qwen3_thinking_* | head -1)
    cp -r "$latest_prep"/* "$TRAINING_DIR/"
    echo -e "${GREEN}✅ Training data prepared in: $TRAINING_DIR${NC}"
fi

# Step 5: Monitor system resources
echo -e "\n${GREEN}✓ Step 4: Checking system resources...${NC}"
echo "Current memory usage:"
top -l 1 | grep -E "PhysMem|CPU usage" | head -2

# Step 6: Launch training
echo -e "\n${GREEN}✓ Step 5: Ready to launch training!${NC}"
echo "================================================"
echo "Training configuration:"
echo "  Model: $MODEL_PATH"
echo "  Data: $TRAINING_DIR"
echo "  Batch size: 1 (optimized for 30B)"
echo "  Learning rate: 2e-5"
echo "  LoRA rank: 64"
echo "  Checkpoints every: 250 steps"
echo "================================================"

# Create final launch command
cat > "$TRAINING_DIR/START_TRAINING.sh" << 'EOF'
#!/bin/bash
# AUTO-GENERATED TRAINING SCRIPT

echo "🚀 LAUNCHING QWEN3-30B THINKING MODEL TRAINING!"
echo "Perfect for your flight duration!"
echo ""

# Set environment
export PYTHONUNBUFFERED=1
export MLX_METAL_MEMORY_LIMIT=48GB

# Monitor in background
(while true; do 
    echo -e "\n📊 [$(date +%H:%M:%S)] Memory check:"
    top -l 1 | grep -E "PhysMem|python" | head -5
    sleep 300  # Check every 5 minutes
done) &
MONITOR_PID=$!

# Run training
python3 -m mlx_lm.lora \
    --model "MODEL_PATH_PLACEHOLDER" \
    --data . \
    --train \
    --batch-size 1 \
    --lora-rank 64 \
    --lora-alpha 128 \
    --lora-dropout 0.05 \
    --iters 1000 \
    --learning-rate 2e-5 \
    --save-every 250 \
    --adapter-path ./adapters \
    2>&1 | tee training_log.txt

# Stop monitor
kill $MONITOR_PID 2>/dev/null

echo ""
echo "✅ Training completed!"
echo "📁 Adapter saved in: ./adapters"
echo "📊 Log saved in: training_log.txt"

# Send notification
osascript -e 'display notification "Qwen3-30B training completed!" with title "MLX Training" sound name "Hero"'
EOF

# Replace placeholder with actual model path
sed -i '' "s|MODEL_PATH_PLACEHOLDER|$MODEL_PATH|g" "$TRAINING_DIR/START_TRAINING.sh"
chmod +x "$TRAINING_DIR/START_TRAINING.sh"

echo -e "\n${GREEN}🎉 EVERYTHING IS READY!${NC}"
echo "================================================"
echo -e "${YELLOW}To start training NOW, run:${NC}"
echo ""
echo "  cd $TRAINING_DIR"
echo "  ./START_TRAINING.sh"
echo ""
echo -e "${YELLOW}To monitor progress:${NC}"
echo "  tail -f $TRAINING_DIR/training_log.txt"
echo ""
echo -e "${GREEN}✈️  Perfect setup for your flight! Miłego lotu!${NC}"
echo "================================================"

# Optional: Auto-start training
read -p "Start training now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$TRAINING_DIR"
    ./START_TRAINING.sh
fi