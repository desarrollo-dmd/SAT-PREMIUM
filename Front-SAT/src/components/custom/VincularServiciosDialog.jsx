import React, { useState, useEffect } from "react";
import ReactFlow, { MiniMap, Controls, Background, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import { Button } from '../shadcn/button'
import { useAxiosInstance } from '../../axiosInstance';
import CustomToast from './CustomToast';
import { useToast } from '../../hooks/use-toast';
import Instructions from './Instruction';

function VincularServiciosDialog() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]); // Estado para todos los documentos
  const [allElements, setAllElements] = useState([]);
  const axiosInstance = useAxiosInstance();
  const { toast, showToast } = useToast();
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const instructions = [
    { action: "Conectar nodos", description: "Arrastra un nodo de documento y conéctalo a un nodo de elemento." },
    { action: "Eliminar relación", description: "Haz doble clic en una conexión existente para eliminarla." },
    { action: "Enviar relaciones", description: "Haz clic en 'Enviar relaciones' para guardar las relaciones creadas." },
  ];

  useEffect(() => {
    const fetchDocumentsAndElements = async () => {
      try {
        // Obtener documentos
        const documentsResponse = await axiosInstance.get("/documentos/obtenerDocumentos");
        const documentsData = documentsResponse.data;
        setAllDocuments(documentsData.documentos);

        // Transformar los documentos en nodos
        const documentNodes = documentsData.documentos.map((doc, index) => ({
          id: `doc-${doc.id_documento}`,
          position: { x: 100, y: 100 + index * 100 },
          data: { label: doc.nombre_documento },
          style: {
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: `hsl(${(index * 360) / documentsData.documentos.length}, 70%, 50%)`,
            color: 'white',
            fontWeight: 'bold',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          },
          sourcePosition: "top",

        }));

        setNodes(documentNodes);
        setEdges([]); // Reiniciar los edges

        // Obtener elementos
        const elementsResponse = await axiosInstance.get("/ordenes/fetchServices");
        const elementsData = elementsResponse.data;
        setAllElements(elementsData.message.recordsets[0]);

        const elements = elementsData.message.recordsets[0];

        // Transformar los elementos en nodos
        const columns = 4;
        const verticalSpacing = 75; // Espaciado vertical
        const offsetY = 150; // Desplazamiento adicional en el eje Y

        // Primero, creamos los nodos de elementos
        const elementNodes = elements.map((el, index) => ({
          id: `el-${el.cod_comp.trim()}`,
          position: {
            x: 600 + (index % columns) * 200,
            y: Math.floor(index / columns) * verticalSpacing + offsetY,
          },
          data: { label: el.cod_comp.trim() },
          style: {
            padding: '10px',
            borderRadius: '5px',
            backgroundColor: 'lightgray', // Color inicial, se cambiará más tarde
            color: 'black',
            fontWeight: 'bold',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          },
          targetPosition: "bottom",
        }));

        // Ahora que hemos creado los nodos de elementos, podemos configurar los edges
        const relationsResponse = await axiosInstance.get("/fetchServices/obtenerRelaciones");
        const relationsData = relationsResponse.data;

        // Transformar las relaciones en edges
        const existingEdges = relationsData.map(rel => {
          const sourceNodeId = `el-${rel.cod_comp}`; // ID del nodo de origen
          const targetNodeId = `doc-${rel.id_documento}`; // ID del nodo de destino

          const sourceNode = elementNodes.find(el => el.id === sourceNodeId); // Busca el nodo de origen
          const targetNode = documentNodes.find(doc => doc.id === targetNodeId); // Busca el nodo de destino

          if (!sourceNode) {
            console.warn(`No se encontró el nodo de origen para cod_comp: ${rel.cod_comp}`);
          }
          if (!targetNode) {
            console.warn(`No se encontró el nodo de destino para id_documento: ${rel.id_documento}`);
          }

          return {
            id: `edge-el-${rel.cod_comp}-doc-${rel.id_documento}`,
            source: sourceNodeId,
            target: targetNodeId,
            style: {
              strokeWidth: 2.5,
              stroke: targetNode ? targetNode.style.backgroundColor : "black", // Color del edge basado en el nodo documento
            },
          };
        });

        // Ahora podemos actualizar los nodos de elementos para establecer su color
        const updatedElementNodes = elementNodes.map((elNode) => {
          const relation = relationsData.find(rel => rel.cod_comp.trim() === elNode.id.split('-')[1]);
          const targetNode = relation ? documentNodes.find(doc => doc.id === `doc-${relation.id_documento}`) : null;

          return {
            ...elNode,
            style: {
              ...elNode.style,
              backgroundColor: targetNode ? targetNode.style.backgroundColor : 'lightgray', // Asigna el color del nodo documento
            }
          };
        });

        setNodes((prevNodes) => [...prevNodes, ...updatedElementNodes, ...documentNodes]); // Agrega ambos tipos de nodos
        setEdges(existingEdges); // Establecer los edges después de crear los nodos
        setIsButtonDisabled(true);

      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchDocumentsAndElements();
  }, []);



  const onConnect = (params) => {
    const sourceNode = nodes.find(node => node.id === params.source);
    const targetNode = nodes.find(node => node.id === params.target);

    // Identifica el nodo de documento y el nodo de elemento
    const documentoNode = sourceNode?.id.startsWith('doc-') ? sourceNode : targetNode?.id.startsWith('doc-') ? targetNode : null;
    const elementoNode = documentoNode === sourceNode ? targetNode : sourceNode;

    // Verifica que la conexión es válida entre un nodo documento y un nodo elemento
    if (documentoNode && elementoNode && elementoNode.id.startsWith('el-')) {
      // Verifica si ya existe una conexión entre este elemento y cualquier nodo documento
      const isAlreadyConnected = edges.some(edge =>
        (edge.target === elementoNode.id && edge.source.startsWith('doc-')) ||
        (edge.source === elementoNode.id && edge.target.startsWith('doc-'))
      );

      if (isAlreadyConnected) {
        showToast("Este elemento ya está conectado a otro documento.", 'error');
        return;
      }

      // Verifica si ya existe una conexión entre estos dos nodos
      const existingEdge = edges.find(
        edge =>
          (edge.source === documentoNode.id && edge.target === elementoNode.id) ||
          (edge.source === elementoNode.id && edge.target === documentoNode.id)
      );

      if (existingEdge) {
        showToast("Esta conexión ya existe.", 'error');
        return;
      }

      // Define el nuevo edge con el color del nodo documento
      const newEdge = {
        id: `edge-${documentoNode.id}-${elementoNode.id}`,
        source: documentoNode.id,
        target: elementoNode.id,
        style: {
          strokeWidth: 2.5,
          stroke: documentoNode.style.backgroundColor, // Usa el color del nodo documento
        },
      };

      // Actualiza el nodo elemento para que tenga el color del nodo documento
      const updatedNodes = nodes.map(node => {
        if (node.id === elementoNode.id) {
          return {
            ...node,
            style: {
              ...node.style,
              backgroundColor: documentoNode.style.backgroundColor, // Asigna el color del nodo documento
            },
          };
        }
        return node;
      });

      // Actualiza el estado con los nodos y edges modificados
      setNodes(updatedNodes);
      setEdges((eds) => addEdge(newEdge, eds));
      setIsButtonDisabled(false);

      // Envía la relación con el orden correcto
      const relacion = {
        ServicioLocal: documentoNode.data.label,   // Nombre del nodo documento
        ServicioTango: elementoNode.data.label,    // Nombre del nodo elemento
      };

      console.log("Relacion creada:", relacion);
      // Usa tu función existente para enviar la relación
      // enviarRelacion(relacion); // Descomenta esta línea para usar tu función

    } else {
      showToast("Esta combinación de conexión no es válida.", 'error');
    }
  };






  const onEdgeDoubleClick = (event, edge) => {
    // Eliminar el edge
    setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    setIsButtonDisabled(false);

    // Obtener el nodo de origen y destino del edge eliminado
    let sourceNode = nodes.find(node => node.id === edge.source);
    let targetNode = nodes.find(node => node.id === edge.target);

    // Asegúrate de que sourceNode sea el nodo elemento y targetNode sea el nodo documento
    const isSourceDocument = sourceNode?.id.startsWith('doc-');
    const isTargetDocument = targetNode?.id.startsWith('doc-');

    // Intercambiamos los nodos si es necesario
    if (isSourceDocument && !isTargetDocument) {
      // Si sourceNode es un documento y targetNode es un elemento, intercambiamos
      const temp = sourceNode;
      sourceNode = targetNode;
      targetNode = temp;
    }

    // Verificar si el edge es una relación nueva
    if (edge.isNew) {
      // Si es una relación nueva, restaurar el color del nodo elemento (sourceNode)
      if (sourceNode) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === sourceNode.id) {
              return {
                ...node,
                style: {
                  ...node.style,
                  backgroundColor: 'lightgray', // Restablecer a lightgray
                },
              };
            }
            return node;
          })
        );
      }
      // No hacemos nada con el targetNode para mantener su color original
    } else {
      // Si es una relación existente, restablecer el color al original
      if (sourceNode) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === sourceNode.id) {
              return {
                ...node,
                style: {
                  ...node.style,
                  backgroundColor: 'lightgray', // Aseguramos que el elemento regrese a lightgray
                },
              };
            }
            return node;
          })
        );
      }

      if (targetNode) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === targetNode.id) {
              return {
                ...node,
                style: {
                  ...node.style,
                  backgroundColor: targetNode.originalColor || targetNode.style.backgroundColor, // Mantener el color original del documento
                },
              };
            }
            return node;
          })
        );
      }
    }
  };

  const sendRelationsToBackend = async () => {
    // Crear relaciones con la información necesaria del documento y el componente
    const relations = edges.map(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);

      // Asegúrate de que sourceNode sea el nodo elemento y targetNode sea el nodo documento
      // Cambia las condiciones según cómo se diferencien los nodos
      const isSourceDocument = sourceNode?.id.startsWith('doc-');
      const isTargetDocument = targetNode?.id.startsWith('doc-');

      return {
        ServicioLocal: isTargetDocument ? targetNode.data.label : sourceNode.data.label,  // nombre_documento
        ServicioTango: isTargetDocument ? sourceNode.data.label : targetNode.data.label,   // cod_comp
      };
    });

    // Mostrar las relaciones antes de enviarlas


    try {
      // Enviar el array de relaciones al endpoint
      const response = await axiosInstance.post('/fetchServices/crear', relations);
      showToast("Relaciones procesadas exitosamente", 'success');
      setIsButtonDisabled(true);
    } catch (error) {
      console.error("Error al crear relaciones:", error);
      showToast("Error al crear relaciones", 'error');
    }
  };



  return (
    <div style={{
      width: "100%",
      height: "760px",
      border: "2px solid #ccc",
      borderRadius: "8px",
      padding: "10px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative"
    }}>
      <CustomToast message={toast.message} type={toast.type} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onEdgeDoubleClick={onEdgeDoubleClick}
        fitView
      >
        <Controls style={{ background: '#fff' }} />
        <Background color="#aaa" gap={16} />
      </ReactFlow>

      <div className="flex flex-row items-center gap-8">

        {/* Botón para enviar las relaciones al backend */}
        <Button
          onClick={sendRelationsToBackend} disabled={isButtonDisabled}
          style={{
            marginTop: '10px',
            padding: '12px 24px',
            backgroundColor: '#0A4A8D', // Color de fondo inicial
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#003366')} // Cambia el color al pasar el mouse
          onMouseOut={(e) => (e.target.style.backgroundColor = '#0A4A8D')}  // Vuelve al color original al salir del hover
          onMouseDown={(e) => (e.target.style.transform = 'scale(0.95)')}   // Efecto de "presionado" al hacer clic
          onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}       // Regresa al tamaño original al soltar
        >
          Enviar relaciones
        </Button>

        {/* Agregar el componente Instructions */}
        <Instructions instructions={instructions} />
      </div>

    </div>
  );
}

export default VincularServiciosDialog;
