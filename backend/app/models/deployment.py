from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)

    service_id = Column(
        Integer,
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    version = Column(String(100), nullable=False)
    environment = Column(String(50), nullable=False, default="development")
    status = Column(String(50), nullable=False, default="pending")
    image_tag = Column(String(255), nullable=True)
    deployed_by = Column(String(100), nullable=True)
    logs = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    service = relationship(
        "Service",
        back_populates="deployments",
    )