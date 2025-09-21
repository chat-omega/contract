from neo4j.time import Date, DateTime


def convert_neo4j_date(value):
    if isinstance(value, dict):
        return {k: convert_neo4j_date(v) for k, v in value.items()}
    elif isinstance(value, (list, tuple)):
        return [convert_neo4j_date(item) for item in value]
    elif isinstance(value, (Date, DateTime)):
        return f"{value.year}-{value.month}-{value.day}"
    return value
