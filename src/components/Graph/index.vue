<template>
  <div ref="container" id="container" class="card-image container" style="height: 100%"></div>
</template>

<script>
import * as d3 from 'd3';
import neo4j from 'neo4j-driver';
import '@/util/graph/d3.v3.min.js';
import '@/util/graph/kg_3.js';
import '@/util/graph/jquery-3.4.1.min.js';
import '@/util/graph/materialize.min.js';

export default {
  name: 'Graph',
  data() {
    return {
      driver: null,
      session: null,
      records: [],
      loading: true,
      error: null
    };
  },
  mounted() {
    this.initializeGraph();
  },
  methods: {
    initializeGraph() {
      this.driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '985211Xz'));
      this.session = this.driver.session();
      this.runCypherQuery();
    },
    runCypherQuery() {
      const query = 'MATCH p=()-->() RETURN p';
      this.session.run(query, {}).then(result => {
        this.processResults(result);
      }).catch(error => {
        this.error = error.message;
      }).finally(() => {
        this.loading = false;
      });
    },
    processResults(result) {
      const nodes = [];
      const relationships = [];

      result.records.forEach(record => {
        const path = record.get('p');
        const startNode = path.start;
        const endNode = path.end;
        const relationship = path.segments[0].relationship;

        nodes.push({
          name: startNode.properties.id === undefined ? startNode.properties.source : startNode.properties.id,
          category: startNode.labels[0]
        });
        nodes.push({
          name: endNode.properties.id === undefined ? endNode.properties.source : endNode.properties.id,
          category: endNode.labels[0]
        });
        relationships.push({
          source: startNode.properties.id === undefined ? startNode.properties.source : startNode.properties.id,
          target: endNode.properties.id === undefined ? endNode.properties.source : endNode.properties.id,
          name: relationship.type
        });
      });

      this.drawGraphWithD3(this.buildDataForD3(nodes, relationships));
    },
    buildDataForD3(nodes, relationships) {
      return {
        nodes: nodes.map(node => ({
          id: node.name,
          group: node.category
        })),
        links: relationships.map(rel => ({
          source: rel.source,
          target: rel.target,
          label: rel.name
        }))
      };
    },
    drawGraphWithD3(data) {
      console.log(data);

      try {
        const config = {
          content: "",
          contentHook: null,
          nodeColor: null, // 节点配色
          linkColor: null, // 关系配色
          width: this.$refs.container.clientWidth,
          height: this.$refs.container.clientHeight
        };
        initKG(data, config, this.$refs.container);
      } catch (err) {
        console.error('Error rendering graph:', err);
      }
    }
  },
  beforeDestroy() {
    this.session.close();
    this.driver.close();
  }
};
</script>

<style scoped>
.loading {
  text-align: center;
  margin-top: 20px;
}
.error {
  color: red;
  text-align: center;
  margin-top: 20px;
}
.graph-container {
  width: 100%;
  height: 600px;
}
</style>