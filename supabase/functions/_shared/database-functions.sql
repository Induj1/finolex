
-- Database function to get scan statistics
CREATE OR REPLACE FUNCTION get_scan_statistics(date_from TIMESTAMPTZ)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_scans', COUNT(*),
        'genuine_count', COUNT(*) FILTER (WHERE status = 'genuine'),
        'counterfeit_count', COUNT(*) FILTER (WHERE status = 'counterfeit'),
        'unverified_count', COUNT(*) FILTER (WHERE status = 'unverified'),
        'genuine_rate', ROUND((COUNT(*) FILTER (WHERE status = 'genuine')::decimal / NULLIF(COUNT(*), 0)) * 100, 2),
        'counterfeit_rate', ROUND((COUNT(*) FILTER (WHERE status = 'counterfeit')::decimal / NULLIF(COUNT(*), 0)) * 100, 2),
        'high_risk_scans', COUNT(*) FILTER (WHERE security_flag = 'high_risk'),
        'avg_response_time', ROUND(AVG(response_time_ms), 2)
    ) INTO result
    FROM scan_logs
    WHERE created_at >= date_from;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
