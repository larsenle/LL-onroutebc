-- Test that the role types have been inserted correctly
SET NOCOUNT ON

SELECT COUNT(*) FROM $(DB_NAME).[access].[ORBC_ROLE_TYPE] 
WHERE ROLE_TYPE ='ORBC-READ-CREDIT-ACCOUNT' AND USER_AUTH_GROUP_TYPE IN ('PPCCLERK', 'CTPO', 'HQADMIN')