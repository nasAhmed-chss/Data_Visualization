import pandas as pd

# File paths
select_measure_file = "2025 County Health Rankings Data - v4(Select Measure Data).csv"
additional_measure_file = "2025 County Health Rankings Data - v4(Additional Measure Data).csv"

print("Loading datasets...")

# Load datasets
df_select = pd.read_csv(select_measure_file, header=1, low_memory=False)
df_additional = pd.read_csv(additional_measure_file, header=1, low_memory=False)

# Clean column names
df_select.columns = df_select.columns.str.strip()
df_additional.columns = df_additional.columns.str.strip()

# Remove state summary rows
df_select = df_select[df_select['County'].notna()]
df_additional = df_additional[df_additional['County'].notna()]

# Fix FIPS formatting
df_select['FIPS'] = df_select['FIPS'].astype(str).str.replace(".0", "", regex=False).str.zfill(5)
df_additional['FIPS'] = df_additional['FIPS'].astype(str).str.replace(".0", "", regex=False).str.zfill(5)

# States to keep
states_to_keep = [
    'New York', 'Alabama', 'Connecticut',
    'Mississippi', 'Georgia', 'Louisiana',
    'California', 'New Mexico'
]

df_select_filtered = df_select[df_select['State'].isin(states_to_keep)]
df_additional_filtered = df_additional[df_additional['State'].isin(states_to_keep)]

print("\nCounty counts by state (Select Data):")
print(df_select_filtered.groupby('State')['County'].count())

# 🔥 TOP 10 CORE FIELDS FROM SELECT
select_fields = [
    'FIPS',
    'State',
    'County',
    'Years of Potential Life Lost Rate',
    'Average Number of Physically Unhealthy Days',
    'Average Number of Mentally Unhealthy Days',
    '% Fair or Poor Health',
    'Injury Death Rate',
    'Primary Care Physicians Rate',
    '% Uninsured',
    '% Unemployed',
    'Income Ratio',
    '% Children in Poverty'
]

existing_select_fields = [col for col in select_fields if col in df_select_filtered.columns]
df_select_small = df_select_filtered[existing_select_fields].copy()

print("\nSelected core fields:")
print(existing_select_fields)

# 🔥 TOP 10 IMPORTANT FIELDS FROM ADDITIONAL
additional_fields = [
    'FIPS',
    'Median Household Income',
    'Life Expectancy',
    'Drug Overdose Mortality Rate',
    'Firearm Fatalities Rate',
    'Homicide Rate',
    'High School Graduation Rate',
    '% Adults with Obesity',
    '% Adults Reporting Currently Smoking',
    '% Rural',
    'Population'
]

existing_additional_fields = [col for col in additional_fields if col in df_additional_filtered.columns]
df_additional_small = df_additional_filtered[existing_additional_fields].copy()

print("\nSelected enrichment fields:")
print(existing_additional_fields)

# Merge
print("\nMerging datasets...")
df_merged = pd.merge(
    df_select_small,
    df_additional_small,
    on='FIPS',
    how='inner'
)

print("\nMerged shape:", df_merged.shape)

print("\nPreview:")
print(df_merged.head())

# Save final dataset
df_merged.to_csv("merged_full_analysis_dataset.csv", index=False)

print("\nSaved merged_full_analysis_dataset.csv")
