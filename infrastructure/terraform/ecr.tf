resource "aws_ecr_repository" "backend" {
  name                 = "kubestack-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "kubestack-backend"
    Project     = "KubeStack"
    Environment = "development"
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "kubestack-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "kubestack-frontend"
    Project     = "KubeStack"
    Environment = "development"
  }
}