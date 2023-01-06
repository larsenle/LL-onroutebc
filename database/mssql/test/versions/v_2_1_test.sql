SET NOCOUNT ON
IF OBJECT_ID('[$(MSSQL_DB)].[dbo].[ORBC_POWER_UNIT]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(MSSQL_DB)].[dbo].[ORBC_TRAILER]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(MSSQL_DB)].[dbo].[ORBC_VT_COUNTRY]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(MSSQL_DB)].[dbo].[ORBC_VT_POWER_UNIT_TYPE]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(MSSQL_DB)].[dbo].[ORBC_VT_PROVINCE]', 'U') IS NOT NULL 
AND OBJECT_ID('[$(MSSQL_DB)].[dbo].[ORBC_VT_TRAILER_TYPE]', 'U') IS NOT NULL 
    SELECT 1 
ELSE
    SELECT 0