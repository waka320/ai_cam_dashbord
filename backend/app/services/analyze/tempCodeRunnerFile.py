 for tick in x_ticks:
        if tick >= 0 and tick < combined_df['count_1_hour'].max() * 1.1:
            plt.text(tick, -combined_df['count_1_hour'].value_counts().max()/20, f'{int(tick)}', 
                     rotation=270, ha='right', va='top', fontsize=9)