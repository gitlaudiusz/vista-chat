# 🚀 QWEN3-30B THINKING MODEL TRAINING - QUICK START

## 🎯 TLDR - Just Run This When Model Downloads:

```bash
# 1. Find your dataset (should be ~7342 lines with <think> tags)
bash /Users/polyversai/Codebase/Klaudiusz/libraxis-ai/training/find_dataset.sh

# 2. Launch everything (replace path with your dataset)
bash /Users/polyversai/Codebase/Klaudiusz/libraxis-ai/training/LAUNCH_QWEN3_TRAINING.sh /path/to/your/7342_dataset.jsonl
```

## 📁 What We Created:

1. **`find_dataset.sh`** - Finds the 7600 PREMIUM dataset
2. **`validate_dataset.py`** - Validates dataset integrity & thinking tags
3. **`qwen3-thinking-prepare.py`** - Shuffles & splits data (80/20)
4. **`mlx_train_qwen3.py`** - MLX training script
5. **`LAUNCH_QWEN3_TRAINING.sh`** - Master launcher (USE THIS!)

## 🧠 Training Configuration:

- **Model**: Qwen3-30B-A3B-Thinking-2507 (262k context!)
- **Dataset**: 7342 entries with <think> tags
- **Split**: 5873 train / 1469 validation
- **Batch Size**: 1 (for 30B model)
- **Learning Rate**: 2e-5
- **LoRA Rank**: 64 (higher for thinking model)
- **Checkpoints**: Every 250 steps
- **Duration**: Perfect for flight! (~1000 iterations)

## 📊 Monitor During Flight:

```bash
# Watch training progress
tail -f /Users/polyversai/training_runs/qwen3_thinking_*/training_log.txt

# Check memory usage
watch -n 60 'top | head -20'

# See GPU utilization
sudo powermetrics --samplers gpu_power -i1000 -n1
```

## 🎯 Expected Dataset Format:

```json
{"messages": [
  {"role": "user", "content": "Question here"},
  {"role": "assistant", "content": "<think>Internal reasoning...</think> Final answer"}
]}
```

## ⚡ Quick Commands:

```bash
# If model not downloaded yet:
ls -la ~/.lmstudio/models/ | grep -i qwen

# Check download progress:
ps aux | grep -E "(download|convert|qwen)"

# Find running python processes:
ps aux | grep python | grep -v grep
```

## 🚨 Important Notes:

1. **DON'T INTERRUPT THE DOWNLOAD** - Let it finish!
2. Dataset MUST have <think> tags (100% coverage ideal)
3. Model needs ~60GB disk space
4. Training uses ~40-48GB RAM
5. Checkpoints saved every 250 steps

## 🛫 Ready for Takeoff!

Just run the master script when ready:
```bash
bash /Users/polyversai/Codebase/Klaudiusz/libraxis-ai/training/LAUNCH_QWEN3_TRAINING.sh /path/to/dataset.jsonl
```

Miłego lotu! ✈️🧠💪