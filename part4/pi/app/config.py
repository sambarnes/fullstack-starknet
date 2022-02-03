import pydantic


class Config(pydantic.BaseSettings):
    contract_address: str = pydantic.Field(
        default=...,
        description="The hex address of the blackbox contract",
    )
    vehicle_id: int = pydantic.Field(
        default=1,
        description="The vehicle ID to signing for",
    )
    signer_secret: int = pydantic.Field(
        default=...,
        description="The private key to sign with",
    )
    signer_address: str = pydantic.Field(
        default=...,
        description="The hex address of the account contract for the signer",
    )
