import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Table1 = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [tableData, setTableData] = useState(null);
    const [manufacturerName, setManufacturerName] = useState('');

    useEffect(() => {
        const name = searchParams.get('name');
        const profit = searchParams.get('profit');
        const yoy = searchParams.get('yoy');
        const mom = searchParams.get('mom');

        if (!name || !profit || !yoy || !mom) {
            navigate('/');
            return;
        }

        setManufacturerName(name);

        const manufacturer = {
            name,
            profit: parseFloat(profit),
            yoy: parseFloat(yoy),
            mom: parseFloat(mom)
        };

        const fetchTableData = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/generate-metrics-table', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ manufacturer })
                });

                const result = await response.json();
                if (result.success) {
                    setTableData(result.data);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTableData();
    }, [searchParams, navigate]);

    return (
        <Box sx={{ p: 3 }}>
            <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/')}
                sx={{ mb: 2 }}
            >
                Back
            </Button>
            
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1976d2' }}>
                {manufacturerName} - Business Metrics
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 400, gap: 2 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="text.secondary">
                        Generating metrics via Ollama...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This may take 3-5 seconds
                    </Typography>
                </Box>
            ) : tableData ? (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                {tableData.columns.map((col, idx) => (
                                    <TableCell key={idx} sx={{ color: 'white', fontWeight: 600 }}>
                                        {col}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.rows.map((row, idx) => (
                                <TableRow 
                                    key={idx}
                                    sx={{ 
                                        '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' },
                                        '&:hover': { backgroundColor: '#e3f2fd' }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 600 }}>{row.metric}</TableCell>
                                    {row.values.map((val, i) => (
                                        <TableCell key={i}>{val}</TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Typography color="error">Failed to load data</Typography>
            )}
        </Box>
    );
};

export default Table1;
