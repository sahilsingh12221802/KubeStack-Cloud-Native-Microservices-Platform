resource "aws_internet_gateway" "kubestack" {
  vpc_id = aws_vpc.kubestack.id

  tags = {
    Name        = "kubestack-igw"
    Project     = "KubeStack"
    Environment = "development"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.kubestack.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.kubestack.id
  }

  tags = {
    Name        = "kubestack-public-rt"
    Project     = "KubeStack"
    Environment = "development"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}