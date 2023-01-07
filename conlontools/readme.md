update "Tokens" set "CurrentVersionId" = null;
delete from "TokenVersions";
delete from "TokensCategories";
delete from "Categories";
delete from "TradingPairs";

##### list token by trading pair and ratio of volume/market cap
``` sql
select
	rv."TradingPairId",
	tv."MarketCap",
	tp."Name",
	rv."Value",
	rv."InsertedDate",
	cast(tv."Volume24h" + 1 as decimal)/cast(tv."MarketCap" + 1 as decimal) as volMarketCapRatio
from
	"RsiValues" rv
join "TradingPairs" tp on
	rv."TradingPairId" = tp."Id"
join "Tokens" t on	
	tp."TokenId" = t."Id"
join "TokenVolumes" tv on
	t."Id" = tv."TokenId"
where
	tv."MarketCap" between 0 and 50000000
	and to_char(rv."InsertedDate", 'YYYY-MM-DD') = '2022-12-26'
	and cast(tv."Volume24h" + 1 as decimal)/cast(tv."MarketCap" + 1 as decimal) >= 0.25 
order by
	"Value",
	volMarketCapRatio desc;
```
##### list token by % change compared with upper bound of keltner channels
``` sql
select
	tp."Name",
	tp2."Current",
	kcv."Upper",
	kcv."Middle",
	kcv."Lower",
	((kcv."Upper" - tp2."Current")/ tp2."Current")* 100 as ChangePrecentage
from
	"TradingPairs" tp
join "KeltnerChannelsValues" kcv on
	tp."Id" = kcv."TradingPairId"
join "TokenPrices" tp2 on
	tp."Id" = tp2."TradingPairId"
where
	tp2."Current" <= kcv."Upper"
	and tp."Name" not like '%/BTC%'
order by
	((kcv."Upper" - tp2."Current")/ tp2."Current")* 100
```
##### list token by mulitple filters like rsi, kc, stoch,...
``` sql 
select
	tp1."Name",
	tv."MarketCap",
	rv1."Id",
	((tp21."Current" - kcv1."Lower")/ kcv1."Lower")* 100 as "PercentDifKC",
		((sv1."K" - sv1."D")/ sv1."D")* 100 as "PercentDiffStoch",
	rv1."Value",
	kcv1."Id",
	kcv1."Upper",
	kcv1."Middle",
	kcv1."Lower",
	sv1."K" ,
	sv1."D" ,
	tp21."Current" ,
	tp21."Open" ,
	tp21."High" ,
	tp21."Low",
	fil.*
from
	"TradingPairs" tp1
join "Tokens" tp3 on
	tp1."TokenId" = tp3."Id"
join "TokenVolumes" tv on
	tv."TokenId" = tp3."Id"
join (
	select
		distinct on
		(tp."Id")
	tp."Id" as "TradingPairId",
		rv."Id" as "RsiId",
		kcv."Id" as "KcId",
		sv."Id" as "StochId",
		tp2."Id" as "PriceId",
		rv."InsertedDate",
		kcv."InsertedDate",
		sv."InsertedDate",
		tp2."InsertedDate"
	from
		"TradingPairs" tp
	join
		"RsiValues" rv on
		tp."Id" = rv."TradingPairId"
	join "KeltnerChannelsValues" kcv on
		tp."Id" = kcv."TradingPairId"
	join "StochValues" sv on
		tp."Id" = sv."TradingPairId"
	join "TokenPrices" tp2 on
		tp."Id" = tp2."TradingPairId"
	where
		tp2."Current" <= kcv."Upper"
		--- main filter
		-- upper keltner channels
		--and rv."Value" between 40 and 60
		--and sv."K" >= sv."D"
		and (((tp2."Current" >= kcv."Lower"
			and ((tp2."Current" - kcv."Lower")/ kcv."Lower")* 100 <= 20))
			or (tp2."Current" <= kcv."Upper"
				and ((kcv."Upper" - tp2."Current")/ tp2."Current")* 100 <= 20))
			and to_char(rv."InsertedDate", 'YYYY-MM-DD') = '2023-01-04'
				and to_char(kcv."InsertedDate", 'YYYY-MM-DD') = '2023-01-04'
					and to_char(sv."InsertedDate", 'YYYY-MM-DD') = '2023-01-04'
					--- end main filter
				group by
					tp."Id",
					rv."Id",
					kcv."Id",
					sv."Id",
					tp2."Id",
					rv."InsertedDate",
					kcv."InsertedDate",
					sv."InsertedDate",
					tp2."InsertedDate"
				order by
					tp."Id",
					rv."InsertedDate" desc,
					kcv."InsertedDate" desc,
					sv."InsertedDate" desc,
					tp2."InsertedDate" desc
) as fil on
	tp1."Id" = fil."TradingPairId"
join
		"RsiValues" rv1 on
		fil."RsiId" = rv1."Id"
join "KeltnerChannelsValues" kcv1 on
		fil."KcId" = kcv1."Id"
join "StochValues" sv1 on
		fil."StochId" = sv1."Id"
join "TokenPrices" tp21 on
		fil."PriceId" = tp21."Id"
order by
	tv."MarketCap" ,
	((tp21."Current" - kcv1."Lower")/ kcv1."Lower")* 100,
		((sv1."K" - sv1."D") / sv1."D")* 100,
	rv1."Value"
```
https://www.binance.com/bapi/asset/v2/public/asset/asset/get-all-asset
https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-product-by-symbol?symbol=HIGHUSDT

fetch("https://www.binance.com/bapi/composite/v1/public/marketing/tardingPair/detail?symbol=high", {
  "method": "GET"
});