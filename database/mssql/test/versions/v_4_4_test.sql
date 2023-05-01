SET NOCOUNT ON

SET IDENTITY_INSERT $(DB_NAME).[permit].[ORBC_PERMIT] ON 
INSERT INTO $(DB_NAME).permit.ORBC_PERMIT(ID, PERMIT_TYPE_ID, APPLICATION_ORIGIN_ID) VALUES(35, 'TROS', 'ONLINE')
SET IDENTITY_INSERT $(DB_NAME).[permit].[ORBC_PERMIT] OFF

UPDATE $(DB_NAME).permit.ORBC_PERMIT SET PERMIT_APPROVAL_SOURCE_ID = 'PPC' WHERE ID = 35
INSERT INTO $(DB_NAME).permit.ORBC_PERMIT_STATE(PERMIT_ID, PERMIT_STATUS_ID) VALUES(35, 'ISSUED')
SELECT PERMIT_NUMBER FROM $(DB_NAME).permit.ORBC_PERMIT WHERE ID = 35

-- Clean up
DELETE FROM $(DB_NAME).[permit].[ORBC_PERMIT_STATE]
DELETE FROM $(DB_NAME).[permit].[ORBC_PERMIT]