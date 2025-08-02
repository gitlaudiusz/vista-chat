#!/usr/bin/env python3
"""
Qwen3-30B-A3B-Thinking-2507 Training Preparation Script
Perfect setup for flight-duration training jak dla DANII!
"""

import json
import random
import os
import sys
from pathlib import Path
from typing import List, Dict, Tuple
import hashlib
from datetime import datetime

# Training configuration for Qwen3-30B thinking model
CONFIG = {
    "model_name": "qwen3-30b-a3b-thinking-2507",
    "base_model_path": "/Users/polyversai/.lmstudio/models/Qwen3-30B-A3B-Thinking-2507",  # Adjust after download
    "dataset_size": 7342,  # From Sacred Scroll
    "train_split": 0.8,    # 5873 train entries
    "val_split": 0.2,      # 1469 validation entries
    "thinking_tag_check": True,  # Verify all entries have <think> tags
    
    # MLX training params optimized for 30B model on flight
    "batch_size": 1,  # Conservative for 30B model
    "grad_accumulation_steps": 8,  # Effective batch size of 8
    "learning_rate": 2e-5,  # Lower LR for large model
    "num_epochs": 1,  # One full pass during flight
    "warmup_steps": 100,
    "save_every": 250,  # Checkpoint every 250 steps
    "eval_every": 500,
    
    # LoRA configuration for 30B
    "lora_rank": 64,  # Higher rank for thinking model
    "lora_alpha": 128,
    "lora_dropout": 0.05,
    "lora_target_modules": ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    
    # Thinking-specific params
    "max_seq_length": 8192,  # Support for long thinking chains
    "temperature": 0.7,
    "top_p": 0.95,
}

def validate_thinking_entry(entry: Dict) -> bool:
    """Validate that entry has proper thinking tags."""
    if "messages" not in entry:
        return False
    
    # Check if assistant responses contain <think> tags
    for msg in entry.get("messages", []):
        if msg.get("role") == "assistant" and "<think>" in msg.get("content", ""):
            return True
    return False

def shuffle_and_split_dataset(dataset_path: str) -> Tuple[List[Dict], List[Dict]]:
    """Load, validate, shuffle and split the dataset."""
    print(f"🔄 Loading dataset from: {dataset_path}")
    
    entries = []
    thinking_count = 0
    
    with open(dataset_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            try:
                entry = json.loads(line.strip())
                entries.append(entry)
                
                if validate_thinking_entry(entry):
                    thinking_count += 1
                    
                if line_num % 1000 == 0:
                    print(f"  Loaded {line_num} entries...")
                    
            except json.JSONDecodeError as e:
                print(f"⚠️  Error parsing line {line_num}: {e}")
                continue
    
    print(f"✅ Loaded {len(entries)} entries total")
    print(f"🧠 {thinking_count} entries have <think> tags ({thinking_count/len(entries)*100:.1f}%)")
    
    # Shuffle with fixed seed for reproducibility
    random.seed(42)
    random.shuffle(entries)
    print("🔀 Dataset shuffled!")
    
    # Split into train/val
    split_idx = int(len(entries) * CONFIG["train_split"])
    train_data = entries[:split_idx]
    val_data = entries[split_idx:]
    
    print(f"📊 Split: {len(train_data)} train, {len(val_data)} validation")
    
    return train_data, val_data

def save_split_datasets(train_data: List[Dict], val_data: List[Dict], output_dir: str):
    """Save train and validation splits."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    train_path = output_path / "train.jsonl"
    val_path = output_path / "valid.jsonl"
    
    # Save training data
    with open(train_path, 'w', encoding='utf-8') as f:
        for entry in train_data:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    # Save validation data
    with open(val_path, 'w', encoding='utf-8') as f:
        for entry in val_data:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    print(f"💾 Saved train data to: {train_path}")
    print(f"💾 Saved validation data to: {val_path}")
    
    # Calculate checksums
    train_checksum = calculate_checksum(train_path)
    val_checksum = calculate_checksum(val_path)
    
    print(f"🔐 Train checksum: {train_checksum}")
    print(f"🔐 Validation checksum: {val_checksum}")
    
    return train_path, val_path

def calculate_checksum(file_path: Path) -> str:
    """Calculate SHA256 checksum of a file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()[:16]

def create_mlx_config(train_path: Path, val_path: Path, output_dir: Path):
    """Create MLX training configuration."""
    config_path = output_dir / "config.yaml"
    
    config_content = f"""# Qwen3-30B-A3B-Thinking-2507 Training Config
# Generated: {datetime.now().isoformat()}
# Perfect for flight-duration training!

model: "{CONFIG['base_model_path']}"
train_data: "{train_path}"
valid_data: "{val_path}"
output_dir: "{output_dir / 'checkpoints'}"

# Training parameters
batch_size: {CONFIG['batch_size']}
grad_accumulation_steps: {CONFIG['grad_accumulation_steps']}
learning_rate: {CONFIG['learning_rate']}
num_epochs: {CONFIG['num_epochs']}
warmup_steps: {CONFIG['warmup_steps']}
save_every: {CONFIG['save_every']}
eval_every: {CONFIG['eval_every']}

# LoRA configuration
lora_rank: {CONFIG['lora_rank']}
lora_alpha: {CONFIG['lora_alpha']}
lora_dropout: {CONFIG['lora_dropout']}
lora_target_modules: {CONFIG['lora_target_modules']}

# Model specific
max_seq_length: {CONFIG['max_seq_length']}
temperature: {CONFIG['temperature']}
top_p: {CONFIG['top_p']}

# Optimization
use_dora: false  # Disable for initial training
gradient_checkpointing: true  # Enable for memory efficiency
mixed_precision: true  # BF16 training
"""
    
    with open(config_path, 'w') as f:
        f.write(config_content)
    
    print(f"📝 Created MLX config at: {config_path}")
    return config_path

def create_launch_script(config_path: Path, output_dir: Path):
    """Create ready-to-run launch script."""
    script_path = output_dir / "launch_training.sh"
    
    script_content = f"""#!/bin/bash
# Qwen3-30B-A3B-Thinking-2507 Training Launch Script
# Ready to fly! 🚀

echo "🚀 Starting Qwen3-30B-A3B-Thinking-2507 training..."
echo "⏰ Start time: $(date)"

# Set environment
export PYTHONUNBUFFERED=1
export MLX_METAL_MEMORY_LIMIT=48GB  # Adjust based on your system

# Activate MLX environment if needed
# source ~/mlx-env/bin/activate

# Change to training directory
cd "{output_dir}"

# Launch training with MLX
python -m mlx_lm.lora \\
    --config "{config_path}" \\
    --verbose \\
    2>&1 | tee training_log_$(date +%Y%m%d_%H%M%S).log

echo "✅ Training completed!"
echo "⏰ End time: $(date)"

# Optional: Send notification
# osascript -e 'display notification "Qwen3 training completed!" with title "MLX Training"'
"""
    
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    # Make executable
    os.chmod(script_path, 0o755)
    
    print(f"🚀 Created launch script at: {script_path}")
    return script_path

def main():
    """Main preparation workflow."""
    print("🧠 Qwen3-30B-A3B-Thinking-2507 Training Preparation")
    print("=" * 60)
    
    # Check for dataset path argument
    if len(sys.argv) < 2:
        print("⚠️  Usage: python qwen3-thinking-prepare.py <path_to_7600_dataset.jsonl>")
        print("   Looking for the 7342-entry megadataset with thinking tags...")
        sys.exit(1)
    
    dataset_path = sys.argv[1]
    if not Path(dataset_path).exists():
        print(f"❌ Dataset not found at: {dataset_path}")
        sys.exit(1)
    
    # Create output directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = Path(f"/Users/polyversai/training_runs/qwen3_thinking_{timestamp}")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"📁 Output directory: {output_dir}")
    
    # Process dataset
    train_data, val_data = shuffle_and_split_dataset(dataset_path)
    train_path, val_path = save_split_datasets(train_data, val_data, output_dir)
    
    # Create configurations
    config_path = create_mlx_config(train_path, val_path, output_dir)
    launch_script = create_launch_script(config_path, output_dir)
    
    print("\n" + "=" * 60)
    print("✅ PREPARATION COMPLETE! Ready for takeoff!")
    print("=" * 60)
    print(f"\n🎯 To start training, run:")
    print(f"   bash {launch_script}")
    print(f"\n📊 Monitor GPU usage with:")
    print(f"   watch -n 1 'top | head -20'")
    print(f"\n📈 Follow training progress:")
    print(f"   tail -f {output_dir}/training_log_*.log")
    print("\n🛫 Perfect setup for your flight! Miłego lotu!")

if __name__ == "__main__":
    main()