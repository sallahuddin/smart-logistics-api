import { EdgeDto } from '../dto/upload-network.dto';

export class Graph {
  id: string;
  nodes: string[];
  edges: EdgeDto[];
}
