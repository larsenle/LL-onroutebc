SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO
BEGIN TRANSACTION

DROP TABLE [permit].[ORBC_PERMIT_METADATA]
DROP TABLE [permit].[ORBC_PERMIT]
DROP TABLE [permit].[ORBC_VT_PERMIT_TYPE]
DROP TABLE [permit].[ORBC_VT_PERMIT_STATUS]
DROP SCHEMA [permit]

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Reverting initial creation of entities for applying for and issuing permits'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [DDL_FILE_SHA1], [RELEASE_DATE]) VALUES (3, @VersionDescription, '$(FILE_HASH)', getdate())

COMMIT