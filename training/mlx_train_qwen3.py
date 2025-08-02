#!/usr/bin/env python3
"""
MLX Training Script for Qwen3-30B-A3B-Thinking-2507
Optimized for flight-duration training with thinking model
"""

import argparse
import json
import os
import time
from pathlib import Path
from datetime import datetime
import mlx.core as mx
import mlx.nn as nn
import mlx.optimizers as optim
from mlx_lm import load, generate
from mlx_lm.utils import load_model
from mlx_lm.tuner.trainer import TrainingArgs, train
from mlx_lm.tuner.lora import LoRALinear
import numpy as np

class QwenThinkingTrainer:
    def __init__(self, args):
        self.args = args
        self.start_time = time.time()
        
        # Training configuration optimized for 30B model
        self.config = {
            "model": args.model_path,
            "data": args.data_path,
            "adapter_path": args.output_dir,
            "train": True,
            "iters": args.iters,
            "val_batches": args.val_batches,
            "learning_rate": args.learning_rate,
            "batch_size": args.batch_size,
            "lora_rank": args.lora_rank,
            "lora_alpha": args.lora_alpha,
            "lora_dropout": args.lora_dropout,
            "lora_layers": args.lora_layers,
            "test": False,
            "test_batches": 100,
            "seed": 42,
            "resume_adapter_file": None,
            "save_every": args.save_every,
            "grad_checkpoint": True,  # Memory efficient for 30B
        }
        
        print("🧠 Qwen3-30B-A3B-Thinking-2507 MLX Training")
        print("=" * 60)
        print(f"Model: {self.config['model']}")
        print(f"Dataset: {self.config['data']}")
        print(f"Output: {self.config['adapter_path']}")
        print(f"Training for {self.config['iters']} iterations")
        print("=" * 60)
    
    def prepare_data(self):
        """Load and prepare the dataset."""
        print("📚 Loading dataset...")
        
        train_file = Path(self.args.data_path) / "train.jsonl"
        valid_file = Path(self.args.data_path) / "valid.jsonl"
        
        if not train_file.exists() or not valid_file.exists():
            raise FileNotFoundError(f"Training data not found in {self.args.data_path}")
        
        # Count entries
        with open(train_file, 'r') as f:
            train_count = sum(1 for _ in f)
        with open(valid_file, 'r') as f:
            valid_count = sum(1 for _ in f)
        
        print(f"✅ Train entries: {train_count}")
        print(f"✅ Validation entries: {valid_count}")
        
        return str(train_file), str(valid_file)
    
    def monitor_memory(self):
        """Monitor GPU memory usage."""
        # MLX doesn't have direct memory reporting like CUDA
        # But we can monitor system memory
        import subprocess
        
        try:
            result = subprocess.run(['top', '-l', '1', '-n', '10'], 
                                  capture_output=True, text=True)
            print("\n📊 System Memory Status:")
            lines = result.stdout.split('\n')
            for line in lines[:15]:
                if 'PhysMem' in line or 'python' in line.lower():
                    print(f"  {line.strip()}")
        except:
            pass
    
    def train_model(self):
        """Run the training loop."""
        train_file, valid_file = self.prepare_data()
        
        # Update config with file paths
        self.config["data"] = str(Path(self.args.data_path))
        
        print("\n🚀 Starting training...")
        print(f"⏰ Start time: {datetime.now().isoformat()}")
        
        # Create training arguments
        training_args = TrainingArgs(
            batch_size=self.config["batch_size"],
            iters=self.config["iters"],
            val_batches=self.config["val_batches"],
            steps_per_report=10,
            steps_per_eval=self.config["save_every"],
            steps_per_save=self.config["save_every"],
            adapter_path=self.config["adapter_path"],
            grad_checkpoint=self.config["grad_checkpoint"],
            seed=self.config["seed"],
            learning_rate=self.config["learning_rate"],
            lora_rank=self.config["lora_rank"],
            lora_alpha=self.config["lora_alpha"],
            lora_dropout=self.config["lora_dropout"],
            lora_layers=self.config["lora_layers"],
        )
        
        # Launch training
        try:
            # Import the actual training function from mlx_lm
            from mlx_lm.tuner.trainer import train as mlx_train
            
            # Run training
            mlx_train(
                model=self.config["model"],
                tokenizer=self.config["model"],  # Same path for tokenizer
                args=training_args,
                data_dir=self.config["data"],
            )
            
            print("\n✅ Training completed successfully!")
            
        except KeyboardInterrupt:
            print("\n⚠️  Training interrupted by user")
            self.save_checkpoint("interrupted")
        except Exception as e:
            print(f"\n❌ Training error: {e}")
            raise
        
        # Final stats
        elapsed = time.time() - self.start_time
        print(f"\n⏱️  Total training time: {elapsed/3600:.2f} hours")
        
    def save_checkpoint(self, suffix=""):
        """Save a checkpoint."""
        checkpoint_name = f"checkpoint_{self.config['iters']}_{suffix}"
        checkpoint_path = Path(self.config["adapter_path"]) / checkpoint_name
        print(f"💾 Saving checkpoint to: {checkpoint_path}")
        # MLX will handle the actual saving

def main():
    parser = argparse.ArgumentParser(description="MLX Training for Qwen3 Thinking Model")
    parser.add_argument("--model-path", type=str, required=True,
                        help="Path to the base Qwen3 model")
    parser.add_argument("--data-path", type=str, required=True,
                        help="Path to directory containing train.jsonl and valid.jsonl")
    parser.add_argument("--output-dir", type=str, required=True,
                        help="Output directory for adapter checkpoints")
    parser.add_argument("--iters", type=int, default=1000,
                        help="Number of training iterations")
    parser.add_argument("--batch-size", type=int, default=1,
                        help="Batch size (use 1 for 30B model)")
    parser.add_argument("--learning-rate", type=float, default=2e-5,
                        help="Learning rate")
    parser.add_argument("--lora-rank", type=int, default=64,
                        help="LoRA rank")
    parser.add_argument("--lora-alpha", type=int, default=128,
                        help="LoRA alpha")
    parser.add_argument("--lora-dropout", type=float, default=0.05,
                        help="LoRA dropout")
    parser.add_argument("--lora-layers", type=int, default=32,
                        help="Number of layers to apply LoRA to")
    parser.add_argument("--save-every", type=int, default=250,
                        help="Save checkpoint every N steps")
    parser.add_argument("--val-batches", type=int, default=25,
                        help="Number of validation batches")
    
    args = parser.parse_args()
    
    # Create output directory
    Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    
    # Initialize trainer
    trainer = QwenThinkingTrainer(args)
    
    # Start training
    trainer.train_model()

if __name__ == "__main__":
    main()