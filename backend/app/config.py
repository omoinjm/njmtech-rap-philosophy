from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+asyncpg://chamber:chamber@localhost:5432/chamber"
    anthropic_api_key: str = ""
    spotify_client_id: str = ""
    spotify_client_secret: str = ""

    jwt_secret: str = "dev-secret-change-in-production"
    jwt_expire_hours: int = 168

    d1_database_id: str = ""
    cloudflare_account_id: str = ""
    cloudflare_api_token: str = ""
    d1_local_path: str = ".data/auth.db"


settings = Settings()
