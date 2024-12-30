SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO

SET XACT_ABORT ON
GO
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
GO
BEGIN TRANSACTION
GO

-- Remove the indexes on the new columns
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ORBC_POLICY_CONFIGURATION_UQ_IS_PRIMARY_DRAFT')
    DROP INDEX IX_ORBC_POLICY_CONFIGURATION_UQ_IS_PRIMARY_DRAFT ON ORBC_POLICY_CONFIGURATION;
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_FK_ORBC_POLICY_CONFIGURATION_ORIGIN_ID')
    DROP INDEX IX_FK_ORBC_POLICY_CONFIGURATION_ORIGIN_ID ON ORBC_POLICY_CONFIGURATION;
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ORBC_POLICY_CONFIGURATION_IS_DRAFT')
    DROP INDEX IX_ORBC_POLICY_CONFIGURATION_IS_DRAFT ON ORBC_POLICY_CONFIGURATION;
IF EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ORBC_POLICY_CONFIGURATION_EFFECTIVE_DATE')
    DROP INDEX IX_ORBC_POLICY_CONFIGURATION_EFFECTIVE_DATE ON ORBC_POLICY_CONFIGURATION;
GO

IF @@ERROR <> 0 SET NOEXEC ON
GO

-- Drop the columns from main and history tables
ALTER TABLE [dbo].[ORBC_POLICY_CONFIGURATION]
DROP CONSTRAINT FK_ORBC_POLICY_CONFIGURATION_ORIGIN_ID
ALTER TABLE [dbo].[ORBC_POLICY_CONFIGURATION]
DROP COLUMN ORIGIN_ID
ALTER TABLE [dbo].[ORBC_POLICY_CONFIGURATION]
DROP COLUMN IS_PRIMARY_DRAFT
GO

IF @@ERROR <> 0 SET NOEXEC ON
GO

-- Revert the trigger changes to remove the added columns
ALTER TRIGGER [dbo].[ORBC_POLCFG_A_S_IUD_TR] ON [dbo].[ORBC_POLICY_CONFIGURATION] FOR INSERT, UPDATE, DELETE AS
SET NOCOUNT ON
BEGIN TRY
DECLARE @curr_date datetime;
SET @curr_date = getutcdate();
  IF NOT EXISTS(SELECT * FROM inserted) AND NOT EXISTS(SELECT * FROM deleted) 
    RETURN;

  -- historical
  IF EXISTS(SELECT * FROM deleted)
    update [dbo].[ORBC_POLICY_CONFIGURATION_HIST] set END_DATE_HIST = @curr_date where POLICY_CONFIGURATION_ID in (select POLICY_CONFIGURATION_ID from deleted) and END_DATE_HIST is null;
  
  IF EXISTS(SELECT * FROM inserted)
    insert into [dbo].[ORBC_POLICY_CONFIGURATION_HIST] ([POLICY_CONFIGURATION_ID], [EFFECTIVE_DATE], [IS_DRAFT], [CHANGE_DESCRIPTION], [APP_CREATE_TIMESTAMP], [APP_CREATE_USERID], [APP_CREATE_USER_GUID], [APP_CREATE_USER_DIRECTORY], [APP_LAST_UPDATE_TIMESTAMP], [APP_LAST_UPDATE_USER_GUID], [APP_LAST_UPDATE_USER_DIRECTORY], [CONCURRENCY_CONTROL_NUMBER], [DB_CREATE_USERID], [DB_CREATE_TIMESTAMP], [DB_LAST_UPDATE_USERID], [DB_LAST_UPDATE_TIMESTAMP], _POLICY_CONFIGURATION_HIST_ID, END_DATE_HIST, EFFECTIVE_DATE_HIST)
      select [POLICY_CONFIGURATION_ID], [EFFECTIVE_DATE], [IS_DRAFT], [CHANGE_DESCRIPTION], [APP_CREATE_TIMESTAMP], [APP_CREATE_USERID], [APP_CREATE_USER_GUID], [APP_CREATE_USER_DIRECTORY], [APP_LAST_UPDATE_TIMESTAMP], [APP_LAST_UPDATE_USER_GUID], [APP_LAST_UPDATE_USER_DIRECTORY], [CONCURRENCY_CONTROL_NUMBER], [DB_CREATE_USERID], [DB_CREATE_TIMESTAMP], [DB_LAST_UPDATE_USERID], [DB_LAST_UPDATE_TIMESTAMP], (next value for [dbo].[ORBC_POLICY_CONFIGURATION_H_ID_SEQ]) as [_POLICY_CONFIGURATION_HIST_ID], null as [END_DATE_HIST], @curr_date as [EFFECTIVE_DATE_HIST] from inserted;

END TRY
BEGIN CATCH
   IF @@trancount > 0 ROLLBACK TRANSACTION
   EXEC orbc_error_handling
END CATCH;
GO

IF @@ERROR <> 0 SET NOEXEC ON
GO

-- Remove the added policy configuration
DELETE FROM [dbo].[ORBC_POLICY_CONFIGURATION]
WHERE POLICY_CONFIGURATION_ID = (SELECT MAX(POLICY_CONFIGURATION_ID) FROM [dbo].[ORBC_POLICY_CONFIGURATION])
GO

IF @@ERROR <> 0 SET NOEXEC ON
GO

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Reverting updates to policy configuration table for config versioning'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [RELEASE_DATE]) VALUES (50, @VersionDescription, getutcdate())
GO

IF @@ERROR <> 0 SET NOEXEC ON
GO

COMMIT TRANSACTION
GO
IF @@ERROR <> 0 SET NOEXEC ON
GO
DECLARE @Success AS BIT
SET @Success = 1
SET NOEXEC OFF
IF (@Success = 1) PRINT 'The database revert succeeded'
ELSE BEGIN
   IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION
   PRINT 'The database revert failed'
END
GO