IF OBJECT_ID('dbo.[drugEvents.temp]', 'U') IS NOT NULL DROP TABLE dbo.[drugEvents.temp];
CREATE TABLE [dbo].[drugEvents.temp](
	[PatID] [int] NOT NULL,
	[EntryDate] [date] NOT NULL,
	[Ingredient] varchar(255) NOT NULL,
	[Family] varchar(255) NOT NULL,
	[Dose] float NOT NULL,
	[Event] varchar(55) NOT NULL
) ON [PRIMARY]
GO
IF OBJECT_ID('dbo.drugEvents', 'U') IS NOT NULL DROP TABLE dbo.drugEvents;
CREATE TABLE [dbo].[drugEvents](
	[PatID] [int] NOT NULL,
	[EntryDate] [date] NOT NULL,
	[IngredientId] [int] NOT NULL,
	[Dose] float NOT NULL,
	[EventId] [int] NOT NULL
) ON [PRIMARY]
GO
IF OBJECT_ID('dbo.drugsOfInterest', 'U') IS NOT NULL DROP TABLE dbo.drugsOfInterest;
CREATE TABLE [dbo].[drugsOfInterest](
	[Rubric] varchar(255) NOT NULL,
	[Code] varchar(55) NOT NULL,
	[Family] varchar(255) NOT NULL,
	[Type] varchar(255) NOT NULL,
	[Dose] [float] NULL
) ON [PRIMARY]
GO
IF OBJECT_ID('dbo.drugFamilies', 'U') IS NOT NULL DROP TABLE dbo.drugFamilies;
CREATE TABLE [dbo].[drugFamilies](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Family] varchar(55) NOT NULL,
 CONSTRAINT [PK_drugFamilies] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
IF OBJECT_ID('dbo.drugIngredients', 'U') IS NOT NULL DROP TABLE dbo.drugIngredients;
CREATE TABLE [dbo].[drugIngredients](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Ingredient] varchar(255) NOT NULL,
 CONSTRAINT [PK_drugIngredients] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
IF OBJECT_ID('dbo.drugConditions', 'U') IS NOT NULL DROP TABLE dbo.drugConditions;
CREATE TABLE [dbo].[drugConditions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Condition] varchar(255) NOT NULL,
 CONSTRAINT [PK_drugConditions] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
IF OBJECT_ID('dbo.drugEventIds', 'U') IS NOT NULL DROP TABLE dbo.drugEventIds;
CREATE TABLE [dbo].[drugEventIds](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Event] varchar(255) NOT NULL,
 CONSTRAINT [PK_drugEventIds] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
IF OBJECT_ID('dbo.drugFamilyIngredientLink', 'U') IS NOT NULL DROP TABLE dbo.drugFamilyIngredientLink;
CREATE TABLE [dbo].[drugFamilyIngredientLink](
	[FamilyId] [int] NOT NULL,
	[IngredientId] [int] NOT NULL,
 CONSTRAINT [PK_drugFamilyIngredientLink] PRIMARY KEY CLUSTERED 
(
	[FamilyId] ASC,
	[IngredientId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

IF EXISTS(select * from sys.views where name= 'MEDICATION_EVENTS') DROP VIEW dbo.MEDICATION_EVENTS
GO
CREATE VIEW [dbo].[MEDICATION_EVENTS]
AS
SELECT     e.PatID, e.EntryDate, i.Ingredient, f.Family, e.Dose, ei.Event
FROM         dbo.drugEvents AS e INNER JOIN
                      dbo.drugIngredients AS i ON i.id = e.IngredientId INNER JOIN
                      dbo.drugEventIds AS ei ON ei.id = e.EventId INNER JOIN
                      dbo.drugFamilyIngredientLink AS fil ON fil.IngredientId = e.IngredientId INNER JOIN
                      dbo.drugFamilies AS f ON f.id = fil.FamilyId

GO

IF OBJECT_ID('dbo.drugConditionIngredientLink', 'U') IS NOT NULL DROP TABLE dbo.drugConditionIngredientLink
CREATE TABLE [dbo].[drugConditionIngredientLink](
	[ConditionId] [int] NOT NULL,
	[IngredientId] [int] NOT NULL,
 CONSTRAINT [PK_drugConditionIngredientLink] PRIMARY KEY CLUSTERED 
(
	[ConditionId] ASC,
	[IngredientId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

IF EXISTS(select * from sys.views where name= 'MEDICATION_EVENTS_HTN') DROP VIEW dbo.MEDICATION_EVENTS_HTN
GO
CREATE VIEW [dbo].[MEDICATION_EVENTS_HTN]
AS
SELECT     e.PatID, e.EntryDate, i.Ingredient, f.Family, e.Dose, ei.Event
FROM         dbo.drugEvents AS e INNER JOIN
                      dbo.drugIngredients AS i ON i.id = e.IngredientId INNER JOIN
                      dbo.drugEventIds AS ei ON ei.id = e.EventId INNER JOIN
                      dbo.drugFamilyIngredientLink AS fil ON fil.IngredientId = e.IngredientId INNER JOIN
                      dbo.drugFamilies AS f ON f.id = fil.FamilyId INNER JOIN
                      dbo.[drugConditionIngredientLink] cil on cil.IngredientId = e.IngredientId
                  INNER JOIN dbo.drugConditions c on c.id = cil.ConditionId
                  WHERE c.Condition = 'HTN'

GO


CREATE NONCLUSTERED INDEX [IX_drugEvents_drugtype] ON [dbo].[drugEvents] 
(
	[IngredientId] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_drugEvents_patid] ON [dbo].[drugEvents] 
(
	[PatID] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_drugsOfInterest] ON [dbo].[drugsOfInterest] 
(
	[Code] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
