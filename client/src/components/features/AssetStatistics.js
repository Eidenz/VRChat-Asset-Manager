// src/components/features/AssetStatistics.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CategoryIcon from '@mui/icons-material/Category';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { getCurrencyInfo, SUPPORTED_CURRENCIES } from '../../utils/currencyUtils';

// Import API context
import { useApi } from '../../context/ApiContext';

// Custom colors for charts with better contrast
const COLORS = ['#7e4dd2', '#06d6a0', '#fd6c6e', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e74c3c'];

const AssetStatistics = () => {
  const { assets, loading, preferredCurrency } = useApi();
  const [stats, setStats] = useState({
    spendingByCurrency: [],
    freeAssets: 0,
    maxPrices: {},
    avgPrices: {},
    assetsByType: [],
    spendingByType: {},
    spendingByMonth: [],
  });
  
  // Add state for selected currency filter
  const [selectedCurrency, setSelectedCurrency] = useState('ALL');
  // Add state for chart type
  const [categoryChartType, setCategoryChartType] = useState('pie');
  
  useEffect(() => {
    if (!loading.assets && assets.all && assets.all.length > 0) {
      calculateStats();
    }
  }, [assets.all, loading.assets]);
  
  const calculateStats = () => {
    const allAssets = assets.all;
    
    // Initialize stats
    let freeAssets = 0;
    
    // Initialize maps for category breakdowns
    const typeCountMap = new Map();
    const typeSpendMapByCurrency = new Map(); // We'll organize by currency first
    const monthlySpendMap = new Map();
    const currencySpendMap = new Map();
    const priceCountByCurrency = new Map();
    const priceSumByCurrency = new Map();
    const maxPriceByCurrency = new Map();
    
    // Process each asset
    allAssets.forEach(asset => {
      // Count by type (regardless of price)
      const currentTypeCount = typeCountMap.get(asset.type) || 0;
      typeCountMap.set(asset.type, currentTypeCount + 1);
      
      // Process prices
      if (asset.price) {
        // Extract numeric price and currency
        const assetCurrency = asset.currency || 'USD';
        const currencyInfo = getCurrencyInfo(assetCurrency);
        
        // Extract the numeric value (removing currency symbol)
        let price = parseFloat(asset.price.replace(/[^0-9.]/g, '')) || 0;
        
        if (price === 0) {
          freeAssets++;
        } else {
          // Update price stats for this currency
          const currentSum = priceSumByCurrency.get(assetCurrency) || 0;
          priceSumByCurrency.set(assetCurrency, currentSum + price);
          
          const currentCount = priceCountByCurrency.get(assetCurrency) || 0;
          priceCountByCurrency.set(assetCurrency, currentCount + 1);
          
          const currentMax = maxPriceByCurrency.get(assetCurrency) || 0;
          maxPriceByCurrency.set(assetCurrency, Math.max(currentMax, price));
          
          // Update currency spend map
          const currentCurrencySpend = currencySpendMap.get(assetCurrency) || {
            name: assetCurrency,
            value: 0,
            symbol: currencyInfo.symbol,
            count: 0,
            currencyCode: assetCurrency,
            displayValue: ''
          };
          currentCurrencySpend.value += price;
          currentCurrencySpend.count += 1;
          currentCurrencySpend.displayValue = `${currencyInfo.symbol}${price.toFixed(2)}`;
          currencySpendMap.set(assetCurrency, currentCurrencySpend);
          
          // Update type spending map - now organized by currency first
          if (!typeSpendMapByCurrency.has(assetCurrency)) {
            typeSpendMapByCurrency.set(assetCurrency, new Map());
          }
          
          const typeMapForCurrency = typeSpendMapByCurrency.get(assetCurrency);
          const currentTypeSpend = typeMapForCurrency.get(asset.type) || {
            name: asset.type,
            value: 0,
            currency: assetCurrency,
            symbol: currencyInfo.symbol,
            count: 0,
            displayName: `${asset.type} (${assetCurrency})`
          };
          currentTypeSpend.value += price;
          currentTypeSpend.count += 1;
          typeMapForCurrency.set(asset.type, currentTypeSpend);
          
          // Extract date and add to monthly spending (keeping original currency)
          if (asset.dateAdded) {
            const date = new Date(asset.dateAdded);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleString('default', { month: 'short' });
            const yearMonth = `${monthName} ${date.getFullYear()}`;
            const monthKey = `${monthYear}-${assetCurrency}`;
            
            const currentMonthSpend = monthlySpendMap.get(monthKey) || { 
              name: yearMonth,
              value: 0, 
              date: date,
              count: 0,
              currency: assetCurrency,
              symbol: currencyInfo.symbol,
              displayName: `${yearMonth} (${assetCurrency})`
            };
            
            currentMonthSpend.value += price;
            currentMonthSpend.count += 1;
            monthlySpendMap.set(monthKey, currentMonthSpend);
          }
        }
      } else {
        // Count assets with no price as free
        freeAssets++;
      }
    });
    
    // Calculate average prices by currency
    const avgPrices = {};
    priceCountByCurrency.forEach((count, currency) => {
      const sum = priceSumByCurrency.get(currency) || 0;
      avgPrices[currency] = count > 0 ? sum / count : 0;
    });
    
    // Create max prices object
    const maxPrices = {};
    maxPriceByCurrency.forEach((max, currency) => {
      maxPrices[currency] = max;
    });
    
    // Convert maps to arrays for charts
    // Create spending by type for each currency
    const spendingByType = {};
    typeSpendMapByCurrency.forEach((typeMap, currency) => {
      // For each currency, get all the types and sort by value
      spendingByType[currency] = Array.from(typeMap.values())
        .sort((a, b) => b.value - a.value);
      
      // Process to limit the number of slices in the pie chart
      // Keep top 5 categories, group the rest as "Other"
      if (spendingByType[currency].length > 5) {
        const top5 = spendingByType[currency].slice(0, 5);
        const others = spendingByType[currency].slice(5);
        
        const otherTotal = others.reduce((sum, item) => sum + item.value, 0);
        const otherCount = others.reduce((sum, item) => sum + item.count, 0);
        
        if (otherTotal > 0) {
          top5.push({
            name: "Other",
            value: otherTotal,
            currency: currency,
            symbol: getCurrencyInfo(currency).symbol,
            count: otherCount,
            displayName: `Other (${currency})`
          });
        }
        
        spendingByType[currency] = top5;
      }
    });
    
    const assetsByType = Array.from(typeCountMap, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // Convert and sort monthly spending
    let spendingByMonth = Array.from(monthlySpendMap.values())
      .sort((a, b) => a.date - b.date); // Sort chronologically
    
    // Only show the last 12 months if there are more (for each currency)
    const recentMonths = new Map();
    spendingByMonth.forEach(item => {
      const key = item.currency;
      if (!recentMonths.has(key)) {
        recentMonths.set(key, []);
      }
      const currencyMonths = recentMonths.get(key);
      currencyMonths.push(item);
      
      // Keep sorted
      recentMonths.set(key, currencyMonths.sort((a, b) => a.date - b.date));
    });
    
    // For each currency, keep only the last 12 months
    let filteredMonths = [];
    recentMonths.forEach((months, currency) => {
      if (months.length > 12) {
        filteredMonths = [...filteredMonths, ...months.slice(-12)];
      } else {
        filteredMonths = [...filteredMonths, ...months];
      }
    });
    
    // Format spending by currency for the chart
    const spendingByCurrency = Array.from(currencySpendMap.values())
      .map(item => ({
        name: item.name,
        value: item.value,
        symbol: item.symbol,
        count: item.count,
        formattedValue: `${item.symbol}${item.value.toFixed(2)}`
      }))
      .sort((a, b) => b.value - a.value);
    
    // Set the stats
    setStats({
      spendingByCurrency,
      freeAssets,
      avgPrices,
      maxPrices,
      assetsByType,
      spendingByType,
      spendingByMonth: filteredMonths
    });
    
    // Default the selected currency to the first one if available
    if (spendingByCurrency.length > 0 && selectedCurrency === 'ALL') {
      setSelectedCurrency(spendingByCurrency[0].name);
    }
  };
  
  // Format currency for display
  const formatCurrencyValue = (amount, currencyCode) => {
    const currencyInfo = getCurrencyInfo(currencyCode);
    return `${currencyInfo.symbol}${amount.toFixed(2)}`;
  };
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box 
          sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 1,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}
        >
          <Typography variant="body1" fontWeight="bold" color="text.primary">
            {payload[0].payload.displayName || payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.primary">
            {payload[0].payload.symbol || ''}{payload[0].value.toFixed(2)} {payload[0].payload.currency || ''}
          </Typography>
          {payload[0].payload.count && (
            <Typography variant="body2" color="text.secondary">
              {`Items: ${payload[0].payload.count}`}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };
  
  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
  };
  
  const handleChartTypeChange = (event, newValue) => {
    if (newValue !== null) {
      setCategoryChartType(newValue);
    }
  };
  
  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, displayName }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if segment is significant enough (more than 5%)
    if (percent < 0.05) return null;
    
    // Get the display name without currency
    const displayText = displayName ? displayName.split(' (')[0] : name;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${displayText} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };
  
  // If loading, show progress indicator
  if (loading.assets) {
    return (
      <Paper sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Paper>
    );
  }
  
  // If no price data, show message
  if (assets.all && assets.all.length > 0 && stats.spendingByCurrency.length === 0 && stats.freeAssets === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <AttachMoneyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h3" sx={{ mb: 1 }}>No Price Data Available</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You haven't added price information to any of your assets yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add prices to your assets to see spending statistics and charts here.
          </Typography>
        </Box>
      </Paper>
    );
  }
  
  return (
    <>
      <Typography variant="h2" sx={{ mb: 3 }}>Asset Spending Statistics</Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Spent Per Currency */}
        {stats.spendingByCurrency.map((currency, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={currency.name}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h3">Total in {currency.name}</Typography>
              </Box>
              <Typography variant="h2" color="primary.main" sx={{ mb: 1 }}>
                {currency.formattedValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across {currency.count} paid assets
              </Typography>
            </Paper>
          </Grid>
        ))}
        
        {/* Free Assets */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Paper sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalOfferIcon sx={{ mr: 1, color: '#2ecc71' }} />
              <Typography variant="h3">Free Assets</Typography>
            </Box>
            <Typography variant="h2" sx={{ mb: 1, color: '#2ecc71' }}>
              {stats.freeAssets}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assets with no price information
            </Typography>
          </Paper>
        </Grid>
        
        {/* For each currency, show max price */}
        {Object.entries(stats.maxPrices).map(([currency, maxPrice]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`max-${currency}`}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalOfferIcon sx={{ mr: 1, color: '#fdcb6e' }} />
                <Typography variant="h3">Max {currency}</Typography>
              </Box>
              <Typography variant="h2" sx={{ mb: 1, color: '#fdcb6e' }}>
                {formatCurrencyValue(maxPrice, currency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most expensive {currency} asset
              </Typography>
            </Paper>
          </Grid>
        ))}
        
        {/* For each currency, show average price */}
        {Object.entries(stats.avgPrices).map(([currency, avgPrice]) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`avg-${currency}`}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CategoryIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h3">Avg {currency}</Typography>
              </Box>
              <Typography variant="h2" color="secondary.main" sx={{ mb: 1 }}>
                {formatCurrencyValue(avgPrice, currency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Per paid asset
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={4}>
        {/* Spending by Currency - Now showing separate charts for each currency */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3">Currency Distribution</Typography>
            </Box>
            
            {stats.spendingByCurrency.length > 0 ? (
              <Box sx={{ height: 300 }}>
                {/* Display a pie chart showing the relative number of assets per currency */}
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.spendingByCurrency}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={(entry) => `${entry.name}: ${entry.count} assets`}
                    >
                      {stats.spendingByCurrency.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  No multi-currency data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Spending by Type - Now using selected currency */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3">Spending by Category</Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ToggleButtonGroup
                  value={categoryChartType}
                  exclusive
                  onChange={handleChartTypeChange}
                  aria-label="chart type"
                  size="small"
                >
                  <ToggleButton value="pie" aria-label="pie chart">
                    Pie
                  </ToggleButton>
                  <ToggleButton value="bar" aria-label="bar chart">
                    Bar
                  </ToggleButton>
                </ToggleButtonGroup>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="currency-select-label">Currency</InputLabel>
                  <Select
                    labelId="currency-select-label"
                    id="currency-select"
                    value={selectedCurrency}
                    onChange={handleCurrencyChange}
                    label="Currency"
                  >
                    {stats.spendingByCurrency.map((currency) => (
                      <MenuItem key={currency.name} value={currency.name}>
                        {currency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {selectedCurrency && stats.spendingByType[selectedCurrency] && stats.spendingByType[selectedCurrency].length > 0 ? (
              <Box sx={{ height: 300 }}>
                {categoryChartType === 'pie' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.spendingByType[selectedCurrency]}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={renderCustomizedLabel}
                      >
                        {stats.spendingByType[selectedCurrency].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.spendingByType[selectedCurrency]}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#7e4dd2" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  No spending data available for {selectedCurrency}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Monthly Spending Bar Chart - Split by currency */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3">Monthly Spending</Typography>
              
              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="month-currency-select-label">Currency</InputLabel>
                <Select
                  labelId="month-currency-select-label"
                  id="month-currency-select"
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                  label="Currency"
                >
                  {stats.spendingByCurrency.map((currency) => (
                    <MenuItem key={currency.name} value={currency.name}>
                      {currency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {stats.spendingByMonth.length > 0 ? (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.spendingByMonth.filter(item => item.currency === selectedCurrency)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={60}
                      tickFormatter={(value) => value.split(' ')[0]}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" name="Amount" fill="#7e4dd2" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body1" color="text.secondary">
                  Not enough data to display monthly trends
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Assets Count by Type Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
            <Typography variant="h3" sx={{ mb: 2 }}>Assets by Type</Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.assetsByType}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06d6a0" label={{ position: 'right' }} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default AssetStatistics;