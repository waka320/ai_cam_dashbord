import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import hex2color, rgb_to_hsv
from mpl_toolkits.mplot3d import Axes3D
import colorsys
from sklearn.decomposition import PCA

# 出力ディレクトリの作成
output_dir = "./color_space"
os.makedirs(output_dir, exist_ok=True)

# カラーパレットの名前定義
COLOR_PALETTE_NAMES = [
    "GREEN_YELLOW_RED_ONE", "GREEN_YELLOW_RED", "GREEN_YELLOW_RED_ALT",
    "BLUE_TO_RED", "VIRIDIS", "VIRIDIS_REVERSE", "WHITE_TO_BLUE",
    "RDYLBU_R", "JET", "TURBO", "GRADS", "CMTHERMAL"
]

# カラーパレットの色定義（JavaScriptから移植）
color_palettes = {
    "GREEN_YELLOW_RED_ONE": [
        '#e4f6d7', '#eff6be', '#f9f5a6', '#ffee90', '#ffd069', 
        '#ffbd50', '#feac42', '#f98345', '#f66846', '#f25444'
    ],
    "GREEN_YELLOW_RED": [
        '#e8f5e9', '#c8e6c9', '#a5d6a7', '#fff59d', '#ffe082', 
        '#ffcc80', '#ffab91', '#ef9a9a', '#e57373', '#ef5350'
    ],
    "GREEN_YELLOW_RED_ALT": [
        '#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#fff176', 
        '#ffd54f', '#ffb74d', '#ff8a65', '#e57373', '#d32f2f'
    ],
    "BLUE_TO_RED": [
        '#699ecd', '#83add5', '#9bbfe1', '#b3d1eb', '#cfe4f0', 
        '#fbcacc', '#fa9699', '#f97884', '#f67a80', '#f0545c'
    ],
    "VIRIDIS": [
        '#440154', '#482878', '#3e4989', '#31688e', '#26828e', 
        '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'
    ],
    "VIRIDIS_REVERSE": [
        '#fde725', '#b5de2b', '#6ece58', '#35b779', '#1f9e89', 
        '#26828e', '#31688e', '#3e4989', '#482878', '#440154'
    ],
    "WHITE_TO_BLUE": [
        '#FFFFFF', '#D0E0F0', '#B0C4DE', '#7F8EBE', '#4A69BD', 
        '#004DCC', '#003A99', '#002766', '#001433', '#000000'
    ],
    "RDYLBU_R": [
        '#053061', '#2166ac', '#4393c3', '#92c5de', '#d1e5f0', 
        '#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'
    ],
    "JET": [
        '#000080', '#0000ff', '#00bfff', '#00ffff', '#00ff00', 
        '#80ff00', '#ffff00', '#ff8000', '#ff0000', '#800000'
    ],
    "TURBO": [
        '#30123b', '#4067e9', '#26a4f2', '#4ac16d', '#a7d65d', 
        '#fcce2e', '#fb9e24', '#f06b22', '#d93806', '#7a0403'
    ],
    "GRADS": [
        '#000080', '#0000ff', '#0080ff', '#00ffff', '#00ff80', 
        '#00ff00', '#80ff00', '#ffff00', '#ff8000', '#ff0000'
    ],
    "CMTHERMAL": [
        '#000000', '#240000', '#580000', '#8c0000', '#c03b00', 
        '#f07800', '#ffb000', '#ffe060', '#ffff9f', '#ffffff'
    ]
}

def hex_to_rgb(hex_color):
    """HEX色コードをRGBに変換"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def rgb_to_hsv_custom(rgb):
    """RGBをHSVに変換"""
    return colorsys.rgb_to_hsv(*rgb)

def rgb_to_lab_custom(rgb):
    """RGBをLAB色空間に変換"""
    from skimage import color
    lab = color.rgb2lab([[rgb]])
    return lab[0][0]

def plot_rgb_3d(palette_name, colors, save_path):
    """RGB空間での3Dプロット"""
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')
    
    rgb_values = [hex_to_rgb(color) for color in colors]
    
    # RGB値の取得
    r_values = [rgb[0] for rgb in rgb_values]
    g_values = [rgb[1] for rgb in rgb_values]
    b_values = [rgb[2] for rgb in rgb_values]
    
    # 3Dプロット
    for i, (r, g, b) in enumerate(zip(r_values, g_values, b_values), 1):
        ax.scatter(r, g, b, color=rgb_values[i-1], s=100, label=f'{i}')
        
    # パスの描画
    ax.plot(r_values, g_values, b_values, 'k-', alpha=0.3)
    
    ax.set_xlabel('Red')
    ax.set_ylabel('Green')
    ax.set_zlabel('Blue')
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_zlim(0, 1)
    ax.set_title(f'{palette_name} - RGB Color Space')
    
    # 凡例
    ax.legend(title='混雑度', loc='upper left', bbox_to_anchor=(1.1, 1))
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def plot_hsv_3d(palette_name, colors, save_path):
    """HSV空間での3Dプロット"""
    fig = plt.figure(figsize=(10, 8))
    ax = fig.add_subplot(111, projection='3d')
    
    rgb_values = [hex_to_rgb(color) for color in colors]
    hsv_values = [rgb_to_hsv_custom(rgb) for rgb in rgb_values]
    
    # HSV値の取得
    h_values = [hsv[0] for hsv in hsv_values]
    s_values = [hsv[1] for hsv in hsv_values]
    v_values = [hsv[2] for hsv in hsv_values]
    
    # 3Dプロット
    for i, (h, s, v) in enumerate(zip(h_values, s_values, v_values), 1):
        ax.scatter(h, s, v, color=rgb_values[i-1], s=100, label=f'{i}')
    
    # パスの描画
    ax.plot(h_values, s_values, v_values, 'k-', alpha=0.3)
    
    ax.set_xlabel('Hue')
    ax.set_ylabel('Saturation')
    ax.set_zlabel('Value')
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.set_zlim(0, 1)
    ax.set_title(f'{palette_name} - HSV Color Space')
    
    # 凡例
    ax.legend(title='混雑度', loc='upper left', bbox_to_anchor=(1.1, 1))
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def plot_lab_3d(palette_name, colors, save_path):
    """Lab空間での3Dプロット"""
    try:
        from skimage import color
        
        fig = plt.figure(figsize=(10, 8))
        ax = fig.add_subplot(111, projection='3d')
        
        rgb_values = [hex_to_rgb(color) for color in colors]
        lab_values = [color.rgb2lab([[rgb]])[0][0] for rgb in rgb_values]
        
        # Lab値の取得
        l_values = [lab[0] for lab in lab_values]
        a_values = [lab[1] for lab in lab_values]
        b_values = [lab[2] for lab in lab_values]
        
        # 3Dプロット
        for i, (l, a, b) in enumerate(zip(l_values, a_values, b_values), 1):
            ax.scatter(a, b, l, color=rgb_values[i-1], s=100, label=f'{i}')
        
        # パスの描画
        ax.plot(a_values, b_values, l_values, 'k-', alpha=0.3)
        
        ax.set_xlabel('a* (緑-赤)')
        ax.set_ylabel('b* (青-黄)')
        ax.set_zlabel('L* (明度)')
        ax.set_title(f'{palette_name} - Lab Color Space')
        
        # 凡例
        ax.legend(title='混雑度', loc='upper left', bbox_to_anchor=(1.1, 1))
        
        plt.tight_layout()
        plt.savefig(save_path)
        plt.close()
    except ImportError:
        print("scikit-imageが必要です。'pip install scikit-image'を実行してください。")

def plot_color_swatches(palette_name, colors, save_path):
    """色見本の可視化"""
    fig, ax = plt.figure(figsize=(12, 2)), plt.subplot(111)
    
    for i, color in enumerate(colors):
        ax.add_patch(plt.Rectangle((i, 0), 1, 1, color=color))
        plt.text(i + 0.5, 0.5, str(i+1), ha='center', va='center', 
                 color='white' if sum(hex_to_rgb(color)[:3]) < 1.5 else 'black')
    
    plt.xlim(0, len(colors))
    plt.ylim(0, 1)
    plt.axis('off')
    plt.title(f'{palette_name} - Color Palette')
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def plot_pca_2d(palette_name, colors, save_path):
    """PCAを使った2D可視化"""
    rgb_values = np.array([hex_to_rgb(color) for color in colors])
    
    # PCA変換
    pca = PCA(n_components=2)
    rgb_pca = pca.fit_transform(rgb_values)
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # プロット
    for i, (x, y) in enumerate(rgb_pca):
        ax.scatter(x, y, color=rgb_values[i], s=100, label=f'{i+1}')
        
    # パスの描画
    ax.plot(rgb_pca[:, 0], rgb_pca[:, 1], 'k-', alpha=0.3)
    
    # 各点にラベル付け
    for i, (x, y) in enumerate(rgb_pca):
        ax.annotate(f'{i+1}', (x, y), xytext=(5, 5), textcoords='offset points')
    
    ax.set_xlabel('PCA Component 1')
    ax.set_ylabel('PCA Component 2')
    ax.set_title(f'{palette_name} - PCA Color Space Projection')
    
    # 凡例
    ax.legend(title='混雑度', loc='upper left', bbox_to_anchor=(1.1, 1))
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def plot_all_palettes_comparison(save_path):
    """すべてのパレットの比較プロット"""
    fig, axes = plt.subplots(len(COLOR_PALETTE_NAMES), 1, figsize=(12, len(COLOR_PALETTE_NAMES)*1.2))
    
    for i, palette_name in enumerate(COLOR_PALETTE_NAMES):
        ax = axes[i]
        colors = color_palettes[palette_name]
        
        for j, color in enumerate(colors):
            ax.add_patch(plt.Rectangle((j, 0), 1, 1, color=color))
            if i == 0:  # 最初のパレットの上に混雑度番号を表示
                ax.text(j + 0.5, 1.1, str(j+1), ha='center', va='center')
        
        ax.set_xlim(0, len(colors))
        ax.set_ylim(0, 1)
        ax.set_yticks([0.5])
        ax.set_yticklabels([palette_name])
        ax.tick_params(left=False)
        ax.set_xticks([])
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

def analyze_color_palettes():
    """すべてのカラーパレットを分析・可視化"""
    # 各パレットの分析
    for palette_name in COLOR_PALETTE_NAMES:
        colors = color_palettes[palette_name]
        
        # RGB 3D空間プロット
        plot_rgb_3d(palette_name, colors, f"{output_dir}/{palette_name}_rgb_3d.png")
        
        # HSV 3D空間プロット
        plot_hsv_3d(palette_name, colors, f"{output_dir}/{palette_name}_hsv_3d.png")
        
        try:
            # Lab 3D空間プロット
            plot_lab_3d(palette_name, colors, f"{output_dir}/{palette_name}_lab_3d.png")
        except:
            print(f"Lab空間の可視化がスキップされました: {palette_name}")
        
        # 色見本プロット
        plot_color_swatches(palette_name, colors, f"{output_dir}/{palette_name}_swatches.png")
        
        # PCA 2D可視化
        plot_pca_2d(palette_name, colors, f"{output_dir}/{palette_name}_pca_2d.png")
    
    # すべてのパレットの比較
    plot_all_palettes_comparison(f"{output_dir}/all_palettes_comparison.png")

if __name__ == "__main__":
    print("カラーパレットの色空間分析を開始します...")
    analyze_color_palettes()
    print(f"分析完了！画像は {output_dir} ディレクトリに保存されました")
