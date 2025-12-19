#!/usr/bin/env python3
"""
依賴圖自動著色工具
根據耦合程度和程式碼相關性對 GraphViz 生成的 SVG 依賴圖進行著色
使用彩虹色票，高對比度設計

使用方法:
    python dependency_colorizer.py input.svg [output.svg]

    如果不指定輸出文件，將自動生成 input_colored.svg
"""

import re
import sys
import os
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from datetime import datetime

# ============================================================================
# 顏色配置
# ============================================================================

# 線段（邊）顏色配置
EDGE_COLORS = {
    'high': ['#ffd400', '#ff0000'],  # 橙色到紅色：高耦合
    'medium_high': ['#b4ff00', '#cfff00', '#e9ff00'],  # 黃綠到黃色：中高耦合
    'medium': ['#36ff8a', '#21ff55', '#15ff00'],  # 綠色系：中等耦合
    'medium_low': ['#5ffff4', '#4bffbf'],  # 青綠色系：中低耦合
    'low': ['#1484ff', '#29a4ff', '#3ec4ff', '#53e5ff']  # 藍色系：低耦合
}

# 節點顏色配置
NODE_COLORS = {
    'highest': '#ff0000',  # 紅色：最高耦合度
    'high': ['#36ff8a', '#21ff55', '#15ff00', '#0cff1f'],  # 綠色系：中高耦合
    'medium': ['#5ffff4', '#4bffbf', '#3ec4ff'],  # 青色系：中等耦合
    'low': ['#53e5ff', '#29a4ff', '#1484ff']  # 藍色系：低耦合
}

# 不透明度設置
EDGE_OPACITY = '0.7'


# ============================================================================
# 工具函數
# ============================================================================

def parse_svg(filepath):
    """
    解析 SVG 文件

    Args:
        filepath: SVG 文件路徑

    Returns:
        tuple: (tree, root, namespaces)
    """
    try:
        # 先嘗試直接解析
        tree = ET.parse(filepath)
        root = tree.getroot()

        # SVG 命名空間
        namespaces = {
            'svg': 'http://www.w3.org/2000/svg',
            'xlink': 'http://www.w3.org/1999/xlink'
        }

        return tree, root, namespaces
    except ET.ParseError as e:
        # 如果遇到編碼問題，嘗試修復
        try:
            print(f"⚠️  檢測到編碼問題，嘗試修復...")

            # 讀取文件內容
            with open(filepath, 'rb') as f:
                content = f.read()

            # 檢測並解碼
            content_str = None
            encoding_used = None

            # 檢查 BOM 並嘗試 UTF-16
            if content.startswith(b'\xff\xfe'):
                # UTF-16 LE with BOM
                content_str = content.decode('utf-16-le')
                encoding_used = 'UTF-16 LE'
            elif content.startswith(b'\xfe\xff'):
                # UTF-16 BE with BOM
                content_str = content.decode('utf-16-be')
                encoding_used = 'UTF-16 BE'
            else:
                # 嘗試多種編碼方式
                for encoding in ['utf-16', 'utf-8', 'utf-8-sig', 'latin-1', 'cp1252', 'iso-8859-1']:
                    try:
                        content_str = content.decode(encoding)
                        encoding_used = encoding
                        break
                    except (UnicodeDecodeError, LookupError):
                        continue

            if content_str is None:
                # 最後手段：忽略錯誤
                content_str = content.decode('utf-8', errors='ignore')
                encoding_used = 'UTF-8 (with errors ignored)'

            print(f"✅ 使用 {encoding_used} 編碼成功")

            # 修復 XML 聲明中的編碼問題
            import re
            # 移除或修正 XML 聲明
            content_str = re.sub(r'<\?xml[^>]*\?>', '<?xml version="1.0" encoding="UTF-8"?>', content_str, count=1)

            # 解析修復後的內容
            root = ET.fromstring(content_str.encode('utf-8'))
            tree = ET.ElementTree(root)

            namespaces = {
                'svg': 'http://www.w3.org/2000/svg',
                'xlink': 'http://www.w3.org/1999/xlink'
            }

            print(f"✅ 文件已修復並成功解析")
            return tree, root, namespaces

        except Exception as fix_error:
            print(f"❌ 修復失敗: {fix_error}")
            print(f"❌ 原始錯誤: {e}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ 解析 SVG 文件失敗: {e}")
        sys.exit(1)


def analyze_dependencies(root):
    """
    分析依賴關係並計算耦合度

    Args:
        root: SVG 根元素

    Returns:
        tuple: (node_coupling, edges, node_in_degree, node_out_degree)
    """
    # 統計每個節點的入度和出度
    node_in_degree = defaultdict(int)
    node_out_degree = defaultdict(int)
    edges = []

    # 遍歷所有邊
    for edge in root.findall('.//{http://www.w3.org/2000/svg}g[@class="edge"]'):
        title = edge.find('.//{http://www.w3.org/2000/svg}title')
        if title is not None and title.text:
            # 解析邊的源和目標 - 支持多種箭頭格式
            # 嘗試 -> 格式
            match = re.match(r'(.+?)->(.+)', title.text)
            if not match:
                # 嘗試 &#45;&gt; 格式（HTML 實體編碼）
                match = re.match(r'(.+?)&#45;&gt;(.+)', title.text)

            if match:
                source, target = match.groups()
                node_out_degree[source] += 1
                node_in_degree[target] += 1
                edges.append((source, target, edge))

    # 計算總耦合度
    node_coupling = {}
    all_nodes = set(list(node_in_degree.keys()) + list(node_out_degree.keys()))

    for node in all_nodes:
        # 耦合度 = 入度 + 出度
        coupling = node_in_degree[node] + node_out_degree[node]
        node_coupling[node] = coupling

    return node_coupling, edges, node_in_degree, node_out_degree


def get_coupling_level(coupling_value, max_coupling):
    """
    根據耦合值獲取耦合等級

    Args:
        coupling_value: 節點的耦合度
        max_coupling: 最大耦合度

    Returns:
        str: 耦合等級 ('highest', 'high', 'medium', 'low')
    """
    if max_coupling == 0:
        return 'low'

    ratio = coupling_value / max_coupling

    if ratio >= 0.8:
        return 'highest'
    elif ratio >= 0.6:
        return 'high'
    elif ratio >= 0.4:
        return 'medium'
    else:
        return 'low'


def get_edge_coupling_level(source, target, node_coupling, max_coupling):
    """
    根據源和目標節點的耦合度獲取邊的耦合等級

    Args:
        source: 源節點名稱
        target: 目標節點名稱
        node_coupling: 節點耦合度字典
        max_coupling: 最大耦合度

    Returns:
        str: 邊的耦合等級
    """
    source_coupling = node_coupling.get(source, 0)
    target_coupling = node_coupling.get(target, 0)
    avg_coupling = (source_coupling + target_coupling) / 2

    if max_coupling == 0:
        return 'low'

    ratio = avg_coupling / max_coupling

    if ratio >= 0.6:
        return 'high'
    elif ratio >= 0.45:
        return 'medium_high'
    elif ratio >= 0.3:
        return 'medium'
    elif ratio >= 0.15:
        return 'medium_low'
    else:
        return 'low'


def select_color_from_range(color_range, index=0):
    """
    從顏色範圍中選擇一個顏色

    Args:
        color_range: 單一顏色字串或顏色列表
        index: 選擇的索引

    Returns:
        str: 顏色代碼
    """
    if isinstance(color_range, str):
        return color_range
    if isinstance(color_range, list):
        return color_range[index % len(color_range)]
    return color_range


def colorize_nodes(root, node_coupling, max_coupling):
    """
    為節點著色

    Args:
        root: SVG 根元素
        node_coupling: 節點耦合度字典
        max_coupling: 最大耦合度

    Returns:
        dict: 各耦合等級的節點統計
    """
    node_stats = defaultdict(int)
    node_count_by_level = defaultdict(int)  # 用於循環選色

    for node_elem in root.findall('.//{http://www.w3.org/2000/svg}g[@class="node"]'):
        title = node_elem.find('.//{http://www.w3.org/2000/svg}title')
        if title is not None and title.text:
            node_name = title.text
            coupling = node_coupling.get(node_name, 0)
            level = get_coupling_level(coupling, max_coupling)
            node_stats[level] += 1

            # 獲取顏色 - 使用循環選色而非插值
            if level == 'highest':
                color = NODE_COLORS['highest']
            else:
                colors = NODE_COLORS.get(level, NODE_COLORS['low'])
                # 使用計數器循環選擇顏色
                idx = node_count_by_level[level] % len(colors)
                color = colors[idx]
                node_count_by_level[level] += 1

            # 更新節點填充顏色
            path = node_elem.find('.//{http://www.w3.org/2000/svg}path')
            if path is not None:
                path.set('fill', color)

                # 如果是低耦合（藍色系），設置白色文字和白色邊框
                if level == 'low':
                    path.set('stroke', 'white')
                    text = node_elem.find('.//{http://www.w3.org/2000/svg}text')
                    if text is not None:
                        text.set('fill', 'white')

    return node_stats


def colorize_edges(root, edges, node_coupling, max_coupling):
    """
    為邊著色

    Args:
        root: SVG 根元素
        edges: 邊的列表
        node_coupling: 節點耦合度字典
        max_coupling: 最大耦合度

    Returns:
        dict: 各耦合等級的邊統計
    """
    edge_count_by_level = defaultdict(int)

    # 計算每條邊的耦合度並排序：低耦合先處理，高耦合後處理
    edges_with_coupling = []
    for source, target, edge_elem in edges:
        source_coupling = node_coupling.get(source, 0)
        target_coupling = node_coupling.get(target, 0)
        avg_coupling = (source_coupling + target_coupling) / 2
        edges_with_coupling.append((avg_coupling, source, target, edge_elem))

    # 按耦合度排序（低到高）
    edges_with_coupling.sort(key=lambda x: x[0])

    # 按順序處理並重新排列 SVG 元素
    graph = root.find('.//{http://www.w3.org/2000/svg}g[@id="graph0"]')
    if graph is not None:
        for avg_coupling, source, target, edge_elem in edges_with_coupling:
            level = get_edge_coupling_level(source, target, node_coupling, max_coupling)
            edge_count_by_level[level] += 1

            # 獲取顏色
            colors = EDGE_COLORS.get(level, EDGE_COLORS['low'])
            idx = edge_count_by_level[level] % len(colors)
            color = colors[idx]

            # 更新邊的顏色
            path = edge_elem.find('.//{http://www.w3.org/2000/svg}path')
            if path is not None:
                path.set('stroke', color)
                path.set('stroke-opacity', EDGE_OPACITY)

            # 更新箭頭的顏色
            polygon = edge_elem.find('.//{http://www.w3.org/2000/svg}polygon')
            if polygon is not None:
                polygon.set('fill', color)
                polygon.set('fill-opacity', EDGE_OPACITY)
                polygon.set('stroke', color)
                polygon.set('stroke-opacity', EDGE_OPACITY)

            # 將邊元素移到最後（高耦合的會在最上層）
            graph.remove(edge_elem)
            graph.append(edge_elem)

    return edge_count_by_level


def generate_report(output_dir, node_coupling, edge_stats, max_coupling, total_nodes, total_edges):
    """
    生成分析報告

    Args:
        output_dir: 輸出目錄
        node_coupling: 節點耦合度字典
        edge_stats: 邊統計字典
        max_coupling: 最大耦合度
        total_nodes: 總節點數
        total_edges: 總邊數
    """
    report_path = os.path.join(output_dir, 'dependency_analysis_report.md')

    # 排序節點
    sorted_nodes = sorted(node_coupling.items(), key=lambda x: x[1], reverse=True)
    top_10 = sorted_nodes[:10]

    # 生成報告內容
    report = f"""# 依賴圖著色分析報告

生成時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 著色方案說明

### 線段（邊）顏色邏輯
根據連接節點的平均耦合程度，使用以下顏色範圍：

| 耦合等級 | 顏色範圍 | 說明 |
|---------|---------|------|
| 高耦合 | #ffd400, #ff0000（橙色到紅色） | 80%+ 最大耦合度 |
| 中高耦合 | #b4ff00, #cfff00, #e9ff00（黃綠到黃色） | 60-80% 最大耦合度 |
| 中等耦合 | #36ff8a, #21ff55, #15ff00（綠色系） | 40-60% 最大耦合度 |
| 中低耦合 | #5ffff4, #4bffbf（青綠色系） | 20-40% 最大耦合度 |
| 低耦合 | #1484ff, #29a4ff, #3ec4ff, #53e5ff（藍色系） | <20% 最大耦合度 |

### 節點顏色邏輯
根據節點的總耦合度（入度 + 出度），使用以下顏色：

| 耦合等級 | 顏色範圍 | 說明 |
|---------|---------|------|
| 最高耦合 | #ff0000（紅色） | 80%+ 最大耦合度 |
| 中高耦合 | #36ff8a, #21ff55, #15ff00, #0cff1f（綠色系） | 60-80% 最大耦合度 |
| 中等耦合 | #5ffff4, #4bffbf, #3ec4ff（青色系） | 40-60% 最大耦合度 |
| 低耦合 | #53e5ff, #29a4ff, #1484ff（藍色系）+ 白色文字和邊框 | <40% 最大耦合度 |

## 分析結果

### 總體統計
- **節點總數**: {total_nodes} 個
- **邊總數**: {total_edges} 條
- **最大耦合度**: {max_coupling}

### Top 10 高耦合節點

"""

    for i, (node, coupling) in enumerate(top_10, 1):
        report += f"{i}. **{node}** - 耦合度: {coupling}\n"

    report += "\n### 邊的耦合分佈\n\n"
    report += "| 耦合等級 | 數量 | 百分比 |\n"
    report += "|---------|------|--------|\n"

    for level in ['high', 'medium_high', 'medium', 'medium_low', 'low']:
        count = edge_stats.get(level, 0)
        percentage = (count / total_edges * 100) if total_edges > 0 else 0
        level_name = {
            'high': '高耦合',
            'medium_high': '中高耦合',
            'medium': '中等耦合',
            'medium_low': '中低耦合',
            'low': '低耦合'
        }[level]
        report += f"| {level_name} | {count} | {percentage:.1f}% |\n"

    report += """
### 關鍵發現

1. **整體架構評估**: 
   - 分析依賴分佈，大部分依賴處於中低耦合說明架構相對健康
   - 高耦合比例過高需要重點關注和重構

2. **核心瓶頸識別**: 
   - 耦合度最高的模組是潛在的維護風險點
   - 建議拆分功能，降低單一模組的責任

3. **模組化建議**:
   - 提取共享邏輯到獨立模組
   - 使用依賴注入模式減少直接依賴
   - 考慮使用事件驅動架構降低耦合

## 改進建議

### 短期改進
1. 重構高耦合模組，拆分職責
2. 識別並消除循環依賴
3. 為核心模組添加接口層

### 長期規劃
1. 建立清晰的模組邊界
2. 採用分層架構設計
3. 定期進行依賴分析和重構

---
*本報告由依賴圖自動著色工具生成*
"""

    # 寫入報告
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)

    return report_path


def colorize_svg(input_file, output_file=None):
    """
    為 SVG 文件著色的主函數

    Args:
        input_file: 輸入 SVG 文件路徑
        output_file: 輸出 SVG 文件路徑（可選）

    Returns:
        tuple: (output_svg_path, report_path)
    """
    # 檢查輸入文件
    if not os.path.exists(input_file):
        print(f"❌ 輸入文件不存在: {input_file}")
        sys.exit(1)

    # 確定輸出文件路徑
    if output_file is None:
        input_path = Path(input_file)
        output_file = str(input_path.parent / f"{input_path.stem}_colored{input_path.suffix}")

    # 確保輸出目錄存在
    output_dir = os.path.dirname(output_file) or '.'
    os.makedirs(output_dir, exist_ok=True)

    print("🚀 開始處理依賴圖...")
    print(f"📄 輸入文件: {input_file}")
    print(f"📄 輸出文件: {output_file}")

    # 解析 SVG
    tree, root, ns = parse_svg(input_file)

    # 分析依賴關係
    print("\n🔍 分析依賴關係...")
    node_coupling, edges, node_in_degree, node_out_degree = analyze_dependencies(root)

    if not node_coupling:
        print("❌ 未找到任何依賴關係")
        sys.exit(1)

    max_coupling = max(node_coupling.values()) if node_coupling else 1
    total_nodes = len(node_coupling)
    total_edges = len(edges)

    print(f"✅ 找到 {total_nodes} 個節點")
    print(f"✅ 找到 {total_edges} 條邊")
    print(f"✅ 最大耦合度: {max_coupling}")

    # 為節點著色
    print("\n🎨 為節點著色...")
    node_stats = colorize_nodes(root, node_coupling, max_coupling)

    # 為邊著色
    print("🎨 為邊著色...")
    edge_stats = colorize_edges(root, edges, node_coupling, max_coupling)

    # 保存結果
    print("\n💾 保存著色後的 SVG...")
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')

    tree.write(output_file, encoding='utf-8', xml_declaration=True)
    print(f"✅ 已保存到: {output_file}")

    # 打印統計摘要
    print("\n" + "=" * 60)
    print("📈 統計摘要")
    print("=" * 60)

    print("\n🔝 Top 5 高耦合節點:")
    sorted_nodes = sorted(node_coupling.items(), key=lambda x: x[1], reverse=True)
    for i, (node, coupling) in enumerate(sorted_nodes[:5], 1):
        print(f"  {i}. {node}: {coupling}")

    print(f"\n📊 邊的耦合分佈:")
    for level, count in sorted(edge_stats.items()):
        percentage = (count / total_edges * 100) if total_edges > 0 else 0
        print(f"  {level}: {count} ({percentage:.1f}%)")

    print("\n" + "=" * 60)
    print("✨ 處理完成！")
    print("=" * 60)

    return output_file


# ============================================================================
# 命令列介面
# ============================================================================

def main():
    """主函數"""
    if len(sys.argv) < 2:
        print("依賴圖自動著色工具")
        print("\n使用方法:")
        print(f"  {sys.argv[0]} <input.svg> [output.svg]")
        print("\n參數:")
        print("  input.svg   - 輸入的 SVG 依賴圖文件")
        print("  output.svg  - 輸出的著色 SVG 文件（可選，默認為 input_colored.svg）")
        print("\n範例:")
        print(f"  {sys.argv[0]} dependencies.svg")
        print(f"  {sys.argv[0]} dependencies.svg colored_result.svg")
        sys.exit(0)

    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        colorize_svg(input_file, output_file)
    except Exception as e:
        print(f"\n❌ 發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()