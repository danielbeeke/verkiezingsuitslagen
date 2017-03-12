CREATE TABLE parties (
  ID SERIAL PRIMARY KEY,
  name VARCHAR,
  color VARCHAR,
  CONSTRAINT unique_name UNIQUE (name)
);

CREATE TABLE party_aliases (
  ID SERIAL PRIMARY KEY,
  alias VARCHAR,
  party_ID INTEGER,
  year INTEGER,
  CONSTRAINT unique_party_id_per_year UNIQUE (party_ID, year),
  CONSTRAINT unique_party_alias_per_year UNIQUE (year, alias)
);

CREATE TABLE seats (
  year INTEGER,
  party_alias_ID INTEGER,
  number INTEGER,
  CONSTRAINT unique_party_alias_ID UNIQUE (party_alias_ID, year)
);

CREATE TABLE cities (
  ID SERIAL PRIMARY KEY,
  cbs_ID INTEGER,
  name VARCHAR,
  geom GEOMETRY(Point, 4326),
  CONSTRAINT unique_cbs UNIQUE (cbs_ID)
);

CREATE TABLE city_votes_info (
  year INTEGER,
  city_ID INTEGER,
  valid_votes INTEGER,
  invalid_votes INTEGER,
  entitled_voters INTEGER,
  attendance INTEGER,
  PRIMARY KEY(city_ID, year),
  CONSTRAINT unique_city_ID_year UNIQUE (city_ID, year)
);

CREATE TABLE city_votes (
  year INTEGER,
  city_ID INTEGER,
  party_alias_ID INTEGER,
  votes INTEGER,
  PRIMARY KEY(city_ID, year, party_alias_ID),
  CONSTRAINT unique_city_ID_year_party_alias_ID UNIQUE (city_ID, year, party_alias_ID)
);