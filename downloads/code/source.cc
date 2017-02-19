/* Group1, 201528015329005, Minghao Li */

#include <stdio.h>
#include <string.h>
#include <math.h>

#include "GraphLite.h"

#define VERTEX_CLASS_NAME(name) KCore##name

static int64_t KValue = 0;

class  Vertex_state {
public:
    bool is_deleted = false;
    int64_t current_degree = 0;
};

class VERTEX_CLASS_NAME(InputFormatter): public InputFormatter {
public:
    int64_t getVertexNum() {
        unsigned long long n;
        sscanf(m_ptotal_vertex_line, "%lld", &n);
        m_total_vertex= n;
        return m_total_vertex;
    }
    int64_t getEdgeNum() {
        unsigned long long n;
        sscanf(m_ptotal_edge_line, "%lld", &n);
        m_total_edge= n;
        return m_total_edge;
    }
    int getVertexValueSize() {
        m_n_value_size = sizeof(Vertex_state);
        return m_n_value_size;
    }
    int getEdgeValueSize() {
        m_e_value_size = sizeof(int);
        return m_e_value_size;
    }
    int getMessageValueSize() {
        m_m_value_size = sizeof(int64_t);
        return m_m_value_size;
    }
    void loadGraph() {
        unsigned long long last_vertex;
        unsigned long long from;
        unsigned long long to;
        double weight = 0;
        
        Vertex_state value;
        int outdegree = 0;
        
        const char *line= getEdgeLine();

        // Note: modify this if an edge weight is to be read
        //       modify the 'weight' variable

        sscanf(line, "%lld %lld", &from, &to);
        addEdge(from, to, &weight);

        last_vertex = from;
        ++outdegree;
        for (int64_t i = 1; i < m_total_edge; ++i) {
            line= getEdgeLine();

            // Note: modify this if an edge weight is to be read
            //       modify the 'weight' variable

            sscanf(line, "%lld %lld", &from, &to);
            if (last_vertex != from) {
                addVertex(last_vertex, &value, outdegree);
                last_vertex = from;
                outdegree = 1;
            } else {
                ++outdegree;
            }
            addEdge(from, to, &weight);
        }
        addVertex(last_vertex, &value, outdegree);
    }
};

class VERTEX_CLASS_NAME(OutputFormatter): public OutputFormatter {
public:
    void writeResult() {
        Vertex_state value;   
        int64_t vid;
        char s[1024];

        // Output only requires vertex id
        for (ResultIterator r_iter; ! r_iter.done(); r_iter.next() ) {
            r_iter.getIdValue(vid, &value);
            if(!value.is_deleted){
                int n = sprintf(s, "%lld\n", (unsigned long long)vid);
                writeNextResLine(s, n);
            }
        }
    }
};

/**
 * This aggregator records the number of vertices which send a negative value message
 * Value in this class may all be negative, or zero, never positive.
 */
class VERTEX_CLASS_NAME(Aggregator): public Aggregator<int64_t> {
public:
     void init(){
        m_global = 0;
        m_local = 0;
     }
     void* getGlobal() {
        return &m_global;
     }
     void setGlobal(const void* p) {
        m_global = *(int64_t *) p;
     }
     void* getLocal() {
        return &m_local;
     }
     void merge(const void* p) {
        m_global += * (int64_t *)p;
     }
     void accumulate(const void* p) {
        m_local += *(int64_t *)p;
     }
};

/**
 * Main class
 * Initially set vertex value
 * Get vertex value and check its state, if it's deleted then vote to halt
 * Otherwise deal with the messages received then update current degree
 * If new degree is less than K, do 3 things below:
 * 1. switch value.is_deleted to true, this vertex will voteToHalt() in next superstep
 * 2.set message value to -1 meaning "delete one vertex" or "outdegree minus one"
 * 3.send message to all its neighbours
 * At last update local m_value as the value of message sent
 * Important!
 * If global aggregated value is 0, that indicates the graph is stable
 * no vertex will be deleted since.
 * Ready to voteToHalt()
 */
class VERTEX_CLASS_NAME(): public Vertex<Vertex_state, int, int64_t> {
public:
    void compute(MessageIterator* pmsgs) {
        Vertex_state value;

        //Set initial outdegree
        if (getSuperstep() == 0) {
            value.current_degree = getOutEdgeIterator().size();
            value.is_deleted = false;
            * mutableValue() = value;
        }

        value = getValue();

        //Check vertex state
        if(value.is_deleted) {
            voteToHalt();
            return;
        }

        //Caculate number of deleted neighbours
        int64_t sum = 0;
        for (;!pmsgs->done(); pmsgs->next()) {
            sum += pmsgs->getValue();
        }

        //Update current outdegree
        value.current_degree = value.current_degree + sum;

        int64_t msg = 0;
        int64_t t = * (int64_t *)getAggrGlobal(0);

        //Send message to neighbours
        if (value.current_degree < KValue) {
            value.is_deleted = true;
            msg = -1;
            sendMessageToAllNeighbors(msg);
        } else if ( t == 0){
            voteToHalt();
        }

        * mutableValue() = value;
        accumulateAggr(0, &msg);

    }
};

/**
 * Aggregator rules:
 * A negative global aggregated value means there exists some vertex
 * which is deleted in the superstep just finished
 * And the graph is not stable
*/
class VERTEX_CLASS_NAME(Graph): public Graph {
public:
    VERTEX_CLASS_NAME(Aggregator)* aggregator;

public:
    // argv[0]: PageRankVertex.so
    // argv[1]: <input path>
    // argv[2]: <output path>
    // argv[3]: <K>
    void init(int argc, char* argv[]) {

        setNumHosts(5);
        setHost(0, "localhost", 1411);
        setHost(1, "localhost", 1421);
        setHost(2, "localhost", 1431);
        setHost(3, "localhost", 1441);
        setHost(4, "localhost", 1451);

        if (argc < 4) {
           printf ("Usage: %s <input path> <output path> <K>\n", argv[0]);
           exit(1);
        }

        m_pin_path = argv[1];
        m_pout_path = argv[2];
        KValue = atol(argv[3]);

        aggregator = new VERTEX_CLASS_NAME(Aggregator)[1];
        regNumAggr(1);
        regAggr(0, &aggregator[0]);
    }

    void term() {
        delete[] aggregator;
    }
};

/* STOP: do not change the code below. */
extern "C" Graph* create_graph() {
    Graph* pgraph = new VERTEX_CLASS_NAME(Graph);

    pgraph->m_pin_formatter = new VERTEX_CLASS_NAME(InputFormatter);
    pgraph->m_pout_formatter = new VERTEX_CLASS_NAME(OutputFormatter);
    pgraph->m_pver_base = new VERTEX_CLASS_NAME();

    return pgraph;
}

extern "C" void destroy_graph(Graph* pobject) {
    delete ( VERTEX_CLASS_NAME()* )(pobject->m_pver_base);
    delete ( VERTEX_CLASS_NAME(OutputFormatter)* )(pobject->m_pout_formatter);
    delete ( VERTEX_CLASS_NAME(InputFormatter)* )(pobject->m_pin_formatter);
    delete ( VERTEX_CLASS_NAME(Graph)* )pobject;
}
