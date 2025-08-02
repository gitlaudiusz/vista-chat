#!/usr/bin/env python3
"""
Dataset Validation Script for Qwen3 Thinking Model Training
Ensures data quality and thinking tag presence
"""

import json
import sys
from pathlib import Path
from collections import Counter
from typing import Dict, List, Tuple
import re

class DatasetValidator:
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)
        self.stats = {
            "total_entries": 0,
            "valid_entries": 0,
            "thinking_entries": 0,
            "errors": [],
            "message_lengths": [],
            "thinking_lengths": [],
            "role_distribution": Counter(),
            "language_stats": Counter(),
        }
    
    def validate_entry(self, entry: Dict, line_num: int) -> Tuple[bool, List[str]]:
        """Validate a single dataset entry."""
        errors = []
        
        # Check basic structure
        if not isinstance(entry, dict):
            errors.append(f"Line {line_num}: Entry is not a dictionary")
            return False, errors
        
        if "messages" not in entry:
            errors.append(f"Line {line_num}: Missing 'messages' field")
            return False, errors
        
        messages = entry["messages"]
        if not isinstance(messages, list):
            errors.append(f"Line {line_num}: 'messages' is not a list")
            return False, errors
        
        # Validate message structure
        has_thinking = False
        for idx, msg in enumerate(messages):
            if not isinstance(msg, dict):
                errors.append(f"Line {line_num}, Message {idx}: Not a dictionary")
                continue
                
            if "role" not in msg:
                errors.append(f"Line {line_num}, Message {idx}: Missing 'role'")
                continue
                
            if "content" not in msg:
                errors.append(f"Line {line_num}, Message {idx}: Missing 'content'")
                continue
            
            role = msg["role"]
            content = msg["content"]
            
            # Track role distribution
            self.stats["role_distribution"][role] += 1
            
            # Check for thinking tags in assistant messages
            if role == "assistant":
                if "<think>" in content and "</think>" in content:
                    has_thinking = True
                    # Extract thinking content
                    thinking_match = re.search(r'<think>(.*?)</think>', content, re.DOTALL)
                    if thinking_match:
                        thinking_content = thinking_match.group(1)
                        self.stats["thinking_lengths"].append(len(thinking_content))
            
            # Track message lengths
            self.stats["message_lengths"].append(len(content))
            
            # Detect language (simplified check for Polish)
            if any(char in content for char in "ąćęłńóśźżĄĆĘŁŃÓŚŹŻ"):
                self.stats["language_stats"]["polish"] += 1
            else:
                self.stats["language_stats"]["other"] += 1
        
        if has_thinking:
            self.stats["thinking_entries"] += 1
        
        return len(errors) == 0, errors
    
    def validate_dataset(self) -> Dict:
        """Validate entire dataset and return statistics."""
        print(f"🔍 Validating dataset: {self.dataset_path}")
        print("=" * 60)
        
        if not self.dataset_path.exists():
            print(f"❌ Dataset file not found: {self.dataset_path}")
            return self.stats
        
        with open(self.dataset_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                self.stats["total_entries"] += 1
                
                try:
                    entry = json.loads(line.strip())
                    is_valid, errors = self.validate_entry(entry, line_num)
                    
                    if is_valid:
                        self.stats["valid_entries"] += 1
                    else:
                        self.stats["errors"].extend(errors)
                    
                    # Progress indicator
                    if line_num % 1000 == 0:
                        print(f"  Validated {line_num} entries...")
                        
                except json.JSONDecodeError as e:
                    self.stats["errors"].append(f"Line {line_num}: JSON decode error - {e}")
                except Exception as e:
                    self.stats["errors"].append(f"Line {line_num}: Unexpected error - {e}")
        
        return self.stats
    
    def print_report(self):
        """Print validation report."""
        print("\n" + "=" * 60)
        print("📊 VALIDATION REPORT")
        print("=" * 60)
        
        print(f"\n📈 Dataset Statistics:")
        print(f"  Total entries: {self.stats['total_entries']}")
        print(f"  Valid entries: {self.stats['valid_entries']}")
        print(f"  Invalid entries: {self.stats['total_entries'] - self.stats['valid_entries']}")
        print(f"  Entries with <think> tags: {self.stats['thinking_entries']} ({self.stats['thinking_entries']/self.stats['total_entries']*100:.1f}%)")
        
        print(f"\n💬 Message Statistics:")
        print(f"  Total messages: {sum(self.stats['role_distribution'].values())}")
        print(f"  Role distribution:")
        for role, count in self.stats['role_distribution'].most_common():
            print(f"    - {role}: {count}")
        
        if self.stats['message_lengths']:
            avg_msg_length = sum(self.stats['message_lengths']) / len(self.stats['message_lengths'])
            print(f"  Average message length: {avg_msg_length:.0f} chars")
            print(f"  Max message length: {max(self.stats['message_lengths'])} chars")
        
        if self.stats['thinking_lengths']:
            avg_think_length = sum(self.stats['thinking_lengths']) / len(self.stats['thinking_lengths'])
            print(f"\n🧠 Thinking Tag Statistics:")
            print(f"  Average thinking length: {avg_think_length:.0f} chars")
            print(f"  Max thinking length: {max(self.stats['thinking_lengths'])} chars")
        
        print(f"\n🌍 Language Distribution:")
        for lang, count in self.stats['language_stats'].most_common():
            print(f"  - {lang}: {count}")
        
        if self.stats['errors']:
            print(f"\n⚠️  Errors Found ({len(self.stats['errors'])} total):")
            # Show first 10 errors
            for error in self.stats['errors'][:10]:
                print(f"  - {error}")
            if len(self.stats['errors']) > 10:
                print(f"  ... and {len(self.stats['errors']) - 10} more errors")
        else:
            print(f"\n✅ No errors found! Dataset is clean!")
        
        # Final verdict
        print("\n" + "=" * 60)
        if self.stats['valid_entries'] == self.stats['total_entries'] and self.stats['thinking_entries'] > 0:
            print("🎉 DATASET VALIDATED SUCCESSFULLY!")
            print(f"   Ready for Qwen3-30B thinking model training!")
        else:
            print("⚠️  DATASET NEEDS ATTENTION")
            print(f"   Fix the errors before training.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_dataset.py <path_to_dataset.jsonl>")
        sys.exit(1)
    
    dataset_path = sys.argv[1]
    validator = DatasetValidator(dataset_path)
    validator.validate_dataset()
    validator.print_report()

if __name__ == "__main__":
    main()