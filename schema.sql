CREATE TABLE parties (
  ID SERIAL PRIMARY KEY,
  name VARCHAR
);

CREATE TABLE party_aliases (
  ID SERIAL PRIMARY KEY,
  alias VARCHAR,
  party_ID INTEGER
);

CREATE TABLE seats (
  year INTEGER,
  party_ID INTEGER,
  number INTEGER
);

CREATE TABLE cities (
  ID SERIAL PRIMARY KEY,
  name VARCHAR,
  geom GEOMETRY(Point, 26910)
);

CREATE TABLE city_votes_info (
  year INTEGER,
  city_ID INTEGER,
  valid_votes INTEGER,
  invalid_votes INTEGER,
  empty_votes INTEGER,
  entitled_voters INTEGER,
  attendance INTEGER
);

CREATE TABLE city_votes (
  year INTEGER,
  city_ID INTEGER,
  party_ID INTEGER,
  votes INTEGER
);