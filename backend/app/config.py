from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    github_token: str = ""
    github_model: str = "openai/gpt-4o"
    spotify_client_id: str = ""
    spotify_client_secret: str = ""

    jwt_secret: str = "dev-secret-change-in-production"
    jwt_expire_hours: int = 168

    d1_database_id: str = ""
    cloudflare_account_id: str = ""
    cloudflare_api_token: str = ""
    d1_local_path: str = ".data/chamber.db"

    @property
    def database_url(self) -> str:
        path = Path(self.d1_local_path).resolve()
        return f"sqlite+aiosqlite:///{path}"


settings = Settings()
