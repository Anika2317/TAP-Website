import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Load data
df = pd.read_csv('mescore_data.csv')
df['date'] = pd.to_datetime(df['date'])

# ── ANALYSIS 1: Engagement over time ──
print("=== PARTICIPANT ENGAGEMENT ===")
engagement = df.groupby('participant_id').size().sort_values(ascending=False)
print(engagement)

# ── ANALYSIS 2: Depth rating distribution ──
depth_order = ['Surface level', 'I understood it', 'It resonated', 'Mind-shifting']
lessons = df[df['data_type'] == 'lesson'].copy()
lessons['depth_numeric'] = lessons['depth_rating'].map({
    'Surface level': 1,
    'I understood it': 2,
    'It resonated': 3,
    'Mind-shifting': 4
})

print("\n=== AVERAGE DEPTH SCORE PER PARTICIPANT ===")
depth_scores = lessons.groupby('participant_id')['depth_numeric'].mean().sort_values(ascending=False)
print(depth_scores)

# ── ANALYSIS 3: Philosophy frequency ──
dilemmas = df[df['data_type'] == 'dilemma'].copy()
print("\n=== MOST USED PHILOSOPHIES ===")
phil_counts = dilemmas['philosophy_used'].value_counts()
print(phil_counts)

# ── ANALYSIS 4: Archetype distribution ──
print("\n=== ARCHETYPE DISTRIBUTION ===")
arch_counts = dilemmas['archetype'].value_counts()
print(arch_counts)

# ── ANALYSIS 5: Depth trend over time for top participant (maleesha) ──
maleesha = lessons[lessons['participant_id'] == 'maleesha'].copy()
maleesha = maleesha.sort_values('date')
maleesha['entry_number'] = range(1, len(maleesha) + 1)

# Linear regression to see if depth improves over time
if len(maleesha) > 2:
    slope, intercept, r_value, p_value, std_err = stats.linregress(
        maleesha['entry_number'], maleesha['depth_numeric']
    )
    print(f"\n=== MALEESHA DEPTH TREND OVER TIME ===")
    print(f"Slope: {slope:.4f} (positive = improving)")
    print(f"R-squared: {r_value**2:.4f}")
    print(f"P-value: {p_value:.4f} ({'significant' if p_value < 0.05 else 'not significant - small sample'})")

# ── PLOT 1: Engagement bar chart ──
plt.figure(figsize=(10, 5))
engagement.plot(kind='bar', color='steelblue', edgecolor='black')
plt.title('ME-Score: Total Engagement by Participant', fontsize=14, fontweight='bold')
plt.xlabel('Participant')
plt.ylabel('Total Activities Completed')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('plot_engagement.png', dpi=150)
plt.close()
print("\nSaved: plot_engagement.png")

# ── PLOT 2: Depth score by participant ──
plt.figure(figsize=(10, 5))
depth_scores.plot(kind='bar', color='coral', edgecolor='black')
plt.title('ME-Score: Average Lesson Depth Score by Participant', fontsize=14, fontweight='bold')
plt.xlabel('Participant')
plt.ylabel('Avg Depth (1=Surface, 4=Mind-shifting)')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('plot_depth_scores.png', dpi=150)
plt.close()
print("Saved: plot_depth_scores.png")

# ── PLOT 3: Philosophy frequency ──
plt.figure(figsize=(12, 5))
phil_counts.head(10).plot(kind='bar', color='mediumseagreen', edgecolor='black')
plt.title('ME-Score: Most Used Ethical Philosophies Across All Dilemmas', fontsize=14, fontweight='bold')
plt.xlabel('Philosophy')
plt.ylabel('Frequency')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig('plot_philosophies.png', dpi=150)
plt.close()
print("Saved: plot_philosophies.png")

# ── PLOT 4: Maleesha depth over time ──
if len(maleesha) > 2:
    plt.figure(figsize=(10, 5))
    plt.plot(maleesha['entry_number'], maleesha['depth_numeric'], marker='o', color='purple', linewidth=2)
    plt.axhline(y=maleesha['depth_numeric'].mean(), color='gray', linestyle='--', label='Average')
    plt.title('ME-Score: Lesson Depth Progression Over Time (maleesha)', fontsize=14, fontweight='bold')
    plt.xlabel('Lesson Number (chronological)')
    plt.ylabel('Depth Score (1=Surface, 4=Mind-shifting)')
    plt.legend()
    plt.tight_layout()
    plt.savefig('plot_depth_trend.png', dpi=150)
    plt.close()
    print("Saved: plot_depth_trend.png")

# ── PLOT 5: Archetype distribution pie chart ──
plt.figure(figsize=(8, 8))
arch_counts.plot(kind='pie', autopct='%1.1f%%', startangle=90)
plt.title('ME-Score: Ethical Archetype Distribution Across All Dilemmas', fontsize=14, fontweight='bold')
plt.ylabel('')
plt.tight_layout()
plt.savefig('plot_archetypes.png', dpi=150)
plt.close()
print("Saved: plot_archetypes.png")

print("\n✅ All analysis complete. Check your folder for the 5 PNG charts.")