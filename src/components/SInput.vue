<script>
import { h } from 'vue'
import { QInput, QSelect } from 'quasar'

export default {
  props: {
    schema: {
      type: Object,
      required: true
    },
    modelValue: [Object, Array, Number, String]
  },
  setup (props) {
    return () => {
      console.log('render SInput', props)

      function getAppropriateType (schema) {
        if (!schema || !schema.type) {
          return QInput
        }

        if (schema.enum) {
          return (x) => h(QSelect, {
            options: schema.enum,
            ...x
          })
        }

        switch (schema.type) {

          case 'integer':
            return (x) => h(QInput, { type: 'number', ...x })
            break

          case 'string':

            if (schema.format) {
              switch (schema.format) {
                case 'uuid':
                case 'guid':
                  return (x) => h(QInput, {
                    mask: 'NNNNNNNN-NNNN-NNNN-NNNN-NNNNNNNNNNNN',
                    shadowText: '________-____-____-____-____________',
                    ...x
                  })
                  break;

                case "byte":
                case "binary":
                    return
                  break;

                default:
                  break
              }
            }

            return QInput
            break

          default:
            return QInput
            break
        }
      }

      return h(getAppropriateType(props.schema), {
        ...props,
        modelValue: props.modelValue === undefined ? props.schema.default || null : props.modelValue,
      })
    }
  }
}
</script>
