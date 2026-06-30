import enum


class Era(str, enum.Enum):
    old_school = "old_school"
    bridge = "bridge"
    new_school = "new_school"


class PhilosophicalCategory(str, enum.Enum):
    epistemology_mysticism = "epistemology_mysticism"
    street_stoicism = "street_stoicism"
    social_ethics = "social_ethics"
    revolutionary_geopolitics = "revolutionary_geopolitics"
