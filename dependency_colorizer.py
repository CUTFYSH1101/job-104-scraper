#!/usr/bin/env python3
"""
依賴圖自動著色工具
使用方法: python dependency_colorizer.py input.svg [output.svg]
"""

import re  # 用正則取代 XML 宣告字串
import sys
import os
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

# region 配色方案
# 線段顏色：根據平均耦合度
EDGE_COLORS = {
    'high': ['#ffd400', '#ff0000'],  # 橙紅：高耦合（≥60%）
    'medium_high': ['#b4ff00', '#cfff00', '#e9ff00'],  # 黃綠：中高耦合（45-60%）
    'medium': ['#36ff8a', '#21ff55', '#15ff00'],  # 綠色：中等耦合（30-45%）
    'medium_low': ['#5ffff4', '#4bffbf'],  # 青綠：中低耦合（15-30%）
    'low': ['#1484ff', '#29a4ff', '#3ec4ff', '#53e5ff']  # 藍色：低耦合（<15%）
}

# 節點顏色：根據總耦合度（連接線段數 = 入度 + 出度）
# 先算「入度 + 出度」
# 再除以最大耦合度，變成比例
# 再用比例分級（0.8 / 0.6 / 0.4）
NODE_COLORS = {
    'highest': '#ff0000',  # 紅色：最高耦合（≥80%）
    'high': ['#36ff8a', '#21ff55', '#15ff00', '#0cff1f'],  # 綠色：中高耦合（60-80%）
    'medium': ['#5ffff4', '#4bffbf', '#3ec4ff'],  # 青色：中等耦合（40-60%）
    'low': ['#53e5ff', '#29a4ff', '#1484ff']  # 藍色：低耦合（<40%）
}

EDGE_OPACITY = '0.7'


# endregion

# region 工具函數
def parse_svg(filepath):
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
            # 強制修正 XML 聲明為 UTF-8 編碼（注意：若原始不是 UTF-8，強制替換可能造成不一致）
            content_str = re.sub(r'<\?xml[^>]*\?>', '<?xml version="1.0" encoding="UTF-8"?>', content_str, count=1)

            # 解析修復後的內容
            root = ET.fromstring(content_str.encode('utf-8'))
            tree = ET.ElementTree(root)
            namespaces = {'svg': 'http://www.w3.org/2000/svg', 'xlink': 'http://www.w3.org/1999/xlink'}
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
    # 計算有多少條線連接在同一個節點上
    node_in_degree = defaultdict(int)
    node_out_degree = defaultdict(int)
    edges = []  # 收集所有邊及其 SVG 元素

    # 遍歷所有邊
    for edge in root.findall('.//{http://www.w3.org/2000/svg}g[@class="edge"]'):
        title = edge.find('.//{http://www.w3.org/2000/svg}title')
        if title is not None and title.text:
            # 解析邊的源和目標 - 支持多種箭頭格式
            # 嘗試 -> 格式
            match = re.match(r'(.+?)->(.+)', title.text)
            if not match:
                # 處理 Graphviz 輸出中常見的 HTML 實體編碼箭頭（->）
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
        coupling = node_in_degree[node] + node_out_degree[node]
        node_coupling[node] = coupling

    return node_coupling, edges, node_in_degree, node_out_degree


def get_coupling_level(coupling_value, max_coupling):
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


def colorize_nodes(root, node_coupling, max_coupling):
    node_stats = defaultdict(int)
    node_count_by_level = defaultdict(int)  # 用於同等級節點循環選色

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
    edge_count_by_level = defaultdict(int)

    # 按耦合度排序，確保高耦合線段繪製在最上層
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

            # 重新排列元素順序，後繪製的線段會覆蓋先繪製的
            graph.remove(edge_elem)
            graph.append(edge_elem)

    return edge_count_by_level


def colorize_svg(input_file, output_file=None):
    if not os.path.exists(input_file):
        print(f"❌ 輸入文件不存在: {input_file}")
        sys.exit(1)

    if output_file is None:
        input_path = Path(input_file)
        output_file = str(input_path.parent / f"{input_path.stem}_colored{input_path.suffix}")

    output_dir = os.path.dirname(output_file) or '.'
    os.makedirs(output_dir, exist_ok=True)

    print("🚀 開始處理依賴圖...")
    print(f"📄 輸入文件: {input_file}")
    print(f"📄 輸出文件: {output_file}")

    tree, root, ns = parse_svg(input_file)

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

    print("\n🎨 為節點著色...")
    node_stats = colorize_nodes(root, node_coupling, max_coupling)

    print("🎨 為邊著色...")
    edge_stats = colorize_edges(root, edges, node_coupling, max_coupling)

    print("\n💾 保存著色後的 SVG...")
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')

    tree.write(output_file, encoding='utf-8', xml_declaration=True)
    print(f"✅ 已保存到: {output_file}")

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


# endregion

# region 命令列介面
def main():
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


# endregion

if __name__ == '__main__':
    main()
