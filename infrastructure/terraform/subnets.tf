resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.kubestack.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name        = "kubestack-public-subnet"
    Project     = "KubeStack"
    Environment = "development"
    Tier        = "public"
  }
}

resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.kubestack.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name        = "kubestack-private-subnet"
    Project     = "KubeStack"
    Environment = "development"
    Tier        = "private"
  }
}