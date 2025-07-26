# DIM Armor Notes CLI

Automatic Notes generator for Destiny 2 DIM Armor CSV exports.

## Description
This CLI tool analyzes Destiny 2 armor stat CSV exports (from [Destiny Item Manager](https://destinyitemmanager.com/)) and generates a new CSV with an additional Notes column, providing stat-based recommendations and percentile rankings. Supports multiple evaluation methods, including a sophisticated percentile-based system.

## Features
- Processes DIM armor CSV exports and adds/updates Notes for each armor piece
- Three evaluation methods:
  - **2.0 (default, recommended):** Percentile analysis using stat lookup tables, supports Artifice/Iron Banner mods, precise percentile ranks.
    - Note: The 2.0 method uses a hardcoded `statClassDists` object reflecting preferred stat combinations for each class. Not all possible stat combinations are considered for all classes—only those deemed relevant or optimal are included.
  - **1.2 (legacy, hard to finetune):** Distribution scoring with build-focused, Fibonacci-weighted rankings 
  - **1.1 (legacy, not recommended):** Simple rule-based GOD/GREAT/GOOD/MAYBE/SHARD classification 
- Supports all classes and armor slots
- Outputs a new CSV with updated Notes

## Installation
<!-- ```sh
npm install -g @cguillot/dim_armor-notes_cli
``` -->
Clone this repo and run locally:
```sh
git clone https://github.com/CGuillotG/dim_armor-notes_cli.git
cd dim_armor-notes_cli
npm install
```

## Usage
```sh
DIM-Armor-Notes --origin <input_csv> --destination <output_csv> [--method <2.0|1.2|1.1>]
```
- `--origin` (`-o`): Input DIM CSV file (default: `storage/destiny-armor.csv`)
- `--destination` (`-d`): Output CSV file (default: `storage/destiny-armor-notes.csv`)
- `--method` (`-m`): Evaluation method (2.0, 1.2, or 1.1; default: 2.0)

### Example
```csv
DIM-Armor-Notes -o storage/destiny-armor.csv -d storage/destiny-armor-notes.csv -m 2.0
```

## Input/Output Format
- **Input:** Standard DIM armor CSV export. Example columns:
  ```csv
  Name,Hash,Id,Tag,Tier,Type,Equippable,Power,Owner,Locked,Equipped,Notes,Perks 0,Perks 1,...
  Abeyant Leap,3637722482,"6917530029723873122",keep,Exotic,Leg Armor,Titan,10,Vault,true,false,,Puppeteer's Control*,...
  ```
- **Output:** Similar as input, with updated/added `Notes` column containing stat-based recommendations and percentile info.

## Methods
- **2.0 (default):** Percentile analysis, best for modern armor and build crafting
- **1.2:** Build-focused scoring, legacy but useful for specific stat distributions
- **1.1:** Simple rule-based, legacy for quick filtering

## Author
CGuillot (<carlos@guillot.dev>)

## License
- ISC 