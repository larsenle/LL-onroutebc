SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET NOCOUNT ON
GO
BEGIN TRANSACTION

CREATE TABLE [dbo].[ORBC_PDF_TEMPLATE](
	[TEMPLATE_ID] [int] IDENTITY(1,1) NOT NULL,
	[TEMPLATE_NAME] [varchar](50) NOT NULL,
	[TEMPLATE_VERSION] [varchar](50) NOT NULL,
	[COMS_REF_ID] [varchar](50) NOT NULL,
 CONSTRAINT [PK_ORBC_PDF_TEMPLATE] PRIMARY KEY CLUSTERED 
(
	[TEMPLATE_ID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

DECLARE @VersionDescription VARCHAR(255)
SET @VersionDescription = 'Initial creation of entities for generating a pdf'

INSERT [dbo].[ORBC_SYS_VERSION] ([VERSION_ID], [DESCRIPTION], [DDL_FILE_SHA1], [RELEASE_DATE]) VALUES (5, @VersionDescription, '$(FILE_HASH)', getdate())

COMMIT