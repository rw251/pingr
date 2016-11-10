USE [DataFromOThomas]

CREATE TABLE [dbo].[drugEvents.temp](
	[PatID] [int] NOT NULL,
	[EntryDate] [date] NOT NULL,
	[Ingredient] varchar(255) NOT NULL,
	[Family] varchar(255) NOT NULL,
	[Dose] float NOT NULL,
	[Event] varchar(55) NOT NULL
) ON [PRIMARY]
GO
CREATE TABLE [dbo].[drugEvents](
	[PatID] [int] NOT NULL,
	[EntryDate] [date] NOT NULL,
	[IngredientId] [int] NOT NULL,
	[Dose] float NOT NULL,
	[EventId] [int] NOT NULL
) ON [PRIMARY]
GO
CREATE TABLE [dbo].[drugFamilies](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Family] varchar(55) NOT NULL,
 CONSTRAINT [PK_drugFamilies] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
CREATE TABLE [dbo].[drugIngredients](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Ingredient] varchar(255) NOT NULL,
 CONSTRAINT [PK_drugIngredients] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
CREATE TABLE [dbo].[drugConditions](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Condition] varchar(255) NOT NULL,
 CONSTRAINT [PK_drugConditions] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
CREATE TABLE [dbo].[drugEventIds](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[Event] varchar(255) NOT NULL,
 CONSTRAINT [PK_drugEventIds] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
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

CREATE VIEW [dbo].[MEDICATION_EVENTS]
AS
SELECT     e.PatID, e.EntryDate, i.Ingredient, f.Family, e.Dose, ei.Event
FROM         dbo.drugEvents AS e INNER JOIN
                      dbo.drugIngredients AS i ON i.id = e.IngredientId INNER JOIN
                      dbo.drugEventIds AS ei ON ei.id = e.EventId INNER JOIN
                      dbo.drugFamilyIngredientLink AS fil ON fil.IngredientId = e.IngredientId INNER JOIN
                      dbo.drugFamilies AS f ON f.id = fil.FamilyId

GO

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



# extract medication data
bcp "select PatID, EntryDate, CodeValue, ReadCode, CodeUnits from DataFromOThomas.dbo.SIR_ALL_Records_No_Rubric where ReadCode like '[abcdefghijklmnopqrstuvwxyz]%' order by PatID, EntryDate" queryout resources/test.dat -c -T -b 10000

npm start -- -a resources/test.dat

npm run -s sort resources/test.dat.done > resources/test.dat.done.sorted

perl parse_drug_file.pl resources/test.dat.done.sorted

bcp DataFromOThomas.dbo.[drugEvents.temp] in resources/test.dat.done.sorted.processed -T -c -e error.txt -b 10000

USE [DataFromOThomas]

INSERT INTO dbo.drugEventIds ([Event])
SELECT [Event] FROM dbo.[drugEvents.temp] GROUP BY [Event]
EXCEPT SELECT [Event] FROM dbo.drugEventIds;

INSERT INTO dbo.drugIngredients (Ingredient)
SELECT Ingredient FROM dbo.[drugEvents.temp] GROUP BY Ingredient
EXCEPT SELECT Ingredient FROM dbo.drugIngredients;

INSERT INTO dbo.drugFamilies(Family)
SELECT Family FROM dbo.[drugEvents.temp] GROUP BY Family
EXCEPT SELECT Family FROM dbo.drugFamilies;

INSERT INTO dbo.drugFamilyIngredientLink (FamilyId, IngredientId)
SELECT f.id,i.id FROM dbo.[drugEvents.temp] t
INNER JOIN drugFamilies f on f.Family = t.Family
INNER JOIN drugIngredients i on i.Ingredient = t.Ingredient
GROUP BY f.id,i.id
EXCEPT SELECT FamilyId, IngredientId FROM dbo.drugFamilyIngredientLink;

INSERT INTO dbo.drugEvents
select PatID,EntryDate,i.id,Dose,e.id from dbo.[drugEvents.temp] t
INNER JOIN drugIngredients i on i.Ingredient = t.Ingredient
INNER JOIN drugEventIds e on e.[Event] = t.[Event];


INSERT INTO drugConditions (Condition) VALUES ('HTN');

INSERT INTO [drugConditionIngredientLink]
SELECT 1,id FROM drugIngredients;


TRUNCATE TABLE dbo.[drugEvents.temp]
