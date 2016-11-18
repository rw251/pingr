INSERT INTO dbo.drugEventIds ([Event])
SELECT [Event] FROM dbo.[drugEvents.temp] GROUP BY [Event]
EXCEPT SELECT [Event] FROM dbo.drugEventIds;

INSERT INTO dbo.drugIngredients (Ingredient)
SELECT Ingredient, MIN(MaxDose), MAX(BNF) FROM dbo.[drugEvents.temp]  t
INNER JOIN drugsOfInterest i on t.Ingredient = i.Type
GROUP BY Ingredient
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