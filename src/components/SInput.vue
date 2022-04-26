<script>
import { h } from 'vue'
import { QFile, QInput, QSelect } from 'quasar'

export default {
  props: {
    schema: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    return () => {

      function getAppropriateType (schema) {
        if (!schema || !schema.type) {
          return { component: QInput }
        }

        if (schema.enum) {
          return {
            component: QSelect,
            extraProps: {
              options: schema.enum,
            }
          }
        }

        switch (schema.type) {

          case 'integer':
            return {
              component: QInput,
              extraProps: { type: 'number' }
            }
            break

          case 'string':

            if (schema.format) {
              switch (schema.format) {
                case 'uuid':
                case 'guid':
                  return {
                    component: QInput,
                    extraProps: {
                      mask: 'NNNNNNNN-NNNN-NNNN-NNNN-NNNNNNNNNNNN'
                    }
                  }
                  break

                case 'byte':
                case 'binary':
                  return { component: QFile }
                  break

                default:
                  break
              }
            }

            return { component: QInput }
            break

          default:
            return { component: QInput }
            break
        }
      }

      const appropriateType = getAppropriateType(props.schema)
      return h(appropriateType.component, appropriateType.extraProps ? { ...appropriateType.extraProps, ...props } : props)
    }
  }
}
</script>
