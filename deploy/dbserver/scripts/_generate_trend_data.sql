IF EXISTS(SELECT * FROM sys.objects WHERE Type = 'P' AND Name ='pingr.trend-data') DROP PROCEDURE [pingr.trend-data];

GO
CREATE PROCEDURE [pingr.trend-data] @ReportDate VARCHAR(10), @stored_procedure_name varchar(512), @yearsToGet int = 2, @everyNMonths int = 2
AS
SET NOCOUNT ON --exclude row count results for call from R
SET ANSI_WARNINGS OFF -- prevent the "Warning: Null value is eliminated by an aggregate or other SET operation." error though BB needs to check this out at some point 

IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[output.pingr.indicator]') AND type in (N'U')) DROP TABLE [dbo].[output.pingr.indicator]
CREATE TABLE [output.pingr.indicator] (indicatorId varchar(1000), practiceId varchar(1000), date date, numerator int, denominator int, target float, benchmark float)

DECLARE @dt datetime;
SET @dt = DATEADD(year, -@yearsToGet, @ReportDate);
DECLARE @ref varchar(10);
     
WHILE (@dt <= @ReportDate) 
  BEGIN 
	SET @ref = CONVERT(VARCHAR(10), @dt, 111);
	 EXEC @stored_procedure_name @refdate = @ref, @JustTheIndicatorNumbersPlease = 1;
 
	set @dt = dateadd(month, @everyNMonths, @dt);
  END -- WHILE

