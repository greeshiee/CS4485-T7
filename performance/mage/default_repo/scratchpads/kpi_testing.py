"""
NOTE: Scratchpad blocks are used only for experimentation and testing out code.
The code written here will not be executed as part of the pipeline.
"""
from kpi_formula.advanced.data_processor import DataProcessor
from kpi_formula.advanced.data_validator import DataValidator
from kpi_formula.advanced.kpi_calculator import KPICalculator
from kpi_formula.advanced.time_series import TimeSeriesAnalyzer

def test_all_features():
    print("\n=== Testing All Features ===\n")
    
    # 测试数据
    sales_data = [100, 120, 150, 140, 160, 180, 200, 220, 240, 260, 280, 300,
                  110, 130, 160, 150, 170, 190, 210, 230, 250, 270, 290, 310]
    
    # 1. 测试 DataProcessor
    print("1. DataProcessor Tests:")
    ma = DataProcessor.moving_average(sales_data, window=3)
    print("- Moving Average (3 months):", ma[:5])
    
    yoy = DataProcessor.year_over_year_growth(sales_data)
    print("- Year over Year Growth (%):", [round(x, 2) for x in yoy[:5]])
    
    # 2. 测试 DataValidator
    print("\n2. DataValidator Tests:")
    test_data = sales_data + ['invalid', 'error']
    cleaned_data, errors = DataValidator.validate_numeric(test_data)
    print("- Validation Errors:", errors)
    
    date_test = "2024-03-20"
    is_valid_date = DataValidator.validate_date_format(date_test)
    print("- Date Validation:", f"'{date_test}' is valid: {is_valid_date}")
    
    # 3. 测试 KPICalculator
    print("\n3. KPICalculator Tests:")
    roi = KPICalculator.roi(revenue=1000, investment=500)
    print("- ROI (%):", roi)
    
    conv_rate = KPICalculator.conversion_rate(conversions=30, visitors=1000)
    print("- Conversion Rate (%):", conv_rate)
    
    clv = KPICalculator.customer_lifetime_value(
        avg_purchase_value=100,
        avg_purchase_frequency=4,
        customer_lifespan=3
    )
    print("- Customer Lifetime Value:", clv)
    
    # 4. 测试 TimeSeriesAnalyzer
    print("\n4. TimeSeriesAnalyzer Tests:")
    trend = TimeSeriesAnalyzer.detect_trend(sales_data)
    print("- Trend Direction:", trend)
    
    forecast = TimeSeriesAnalyzer.forecast_simple(sales_data, periods=3)
    print("- Simple Forecast (next 3 periods):", [round(x, 2) for x in forecast])
    
    try:
        seasonality = TimeSeriesAnalyzer.seasonality(sales_data, period=12)
        print("- Seasonality Analysis:")
        print("  * Seasonal Factors:", [round(x, 2) for x in seasonality['seasonal'][:3]])
        print("  * Trend Values:", [round(x, 2) for x in seasonality['trend'][:3]])
    except ValueError as e:
        print("- Seasonality Analysis:", str(e))

if __name__ == "__main__":
    test_all_features()

